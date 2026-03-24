import { TtlCache } from './cache.js';
import { NotFoundError, UpstreamUnavailableError } from './errors.js';
import { toLlmUrlFromDocs } from './url-utils.js';
import type { McpCapability, McpIndex, McpPage, ServerConfig } from './types.js';

const INDEX_PATH = '/mcp-index.json';

type FetchLike = typeof fetch;

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function assertValidCapability(value: unknown): asserts value is McpCapability {
    if (!isRecord(value)) {
        throw new UpstreamUnavailableError('Invalid capability payload from mcp-index.json');
    }

    if (typeof value.id !== 'string' || typeof value.title !== 'string') {
        throw new UpstreamUnavailableError('Capability payload is missing required fields');
    }

    if (typeof value.pageUrl !== 'string' || typeof value.llmUrl !== 'string') {
        throw new UpstreamUnavailableError('Capability payload has invalid URLs');
    }

    if (!isStringArray(value.relatedPageUrls)) {
        throw new UpstreamUnavailableError('Capability payload has invalid relatedPageUrls');
    }

    for (const key of ['entrypoints', 'inputs', 'outputs', 'constraints', 'sideEffects'] as const) {
        if (!isStringArray(value[key])) {
            throw new UpstreamUnavailableError(`Capability payload has invalid "${key}" field`);
        }
    }
}

function assertValidPage(value: unknown): asserts value is McpPage {
    if (!isRecord(value)) {
        throw new UpstreamUnavailableError('Invalid page payload from mcp-index.json');
    }

    if (
        typeof value.title !== 'string' ||
        typeof value.pageUrl !== 'string' ||
        typeof value.llmUrl !== 'string' ||
        typeof value.sourcePath !== 'string' ||
        typeof value.capability !== 'string'
    ) {
        throw new UpstreamUnavailableError('Page payload has missing required fields');
    }
}

function parseMcpIndex(payload: unknown): McpIndex {
    if (!isRecord(payload)) {
        throw new UpstreamUnavailableError('Invalid mcp-index.json response');
    }

    if (!Array.isArray(payload.capabilities) || !Array.isArray(payload.pages)) {
        throw new UpstreamUnavailableError('mcp-index.json is missing capabilities/pages arrays');
    }

    const capabilities = payload.capabilities.map((capability) => {
        assertValidCapability(capability);
        return capability;
    });

    const pages = payload.pages.map((page) => {
        assertValidPage(page);
        return page;
    });

    return {
        version: typeof payload.version === 'number' ? payload.version : 1,
        generatedAt: typeof payload.generatedAt === 'string' ? payload.generatedAt : new Date(0).toISOString(),
        scope: isStringArray(payload.scope) ? payload.scope : [],
        capabilities,
        pages,
    };
}

function toAbsoluteUrl(baseUrl: string, path: string) {
    return new URL(path, baseUrl).toString();
}

export class DocsClient {
    readonly #config: ServerConfig;
    readonly #fetchImpl: FetchLike;
    readonly #indexCache: TtlCache<McpIndex>;
    readonly #llmCache: TtlCache<string>;

    constructor(config: ServerConfig, fetchImpl: FetchLike = fetch) {
        this.#config = config;
        this.#fetchImpl = fetchImpl;
        this.#indexCache = new TtlCache<McpIndex>(config.cacheTtlMs);
        this.#llmCache = new TtlCache<string>(config.cacheTtlMs);
    }

    async getIndex() {
        const cacheKey = 'index';
        const cached = this.#indexCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const payload = await this.#fetchJson(INDEX_PATH);
        const parsed = parseMcpIndex(payload);
        this.#indexCache.set(cacheKey, parsed);
        return parsed;
    }

    async getCapability(capabilityId: string) {
        const index = await this.getIndex();
        const match =
            index.capabilities.find((capability) => capability.id === capabilityId) ??
            index.capabilities.find((capability) => capability.id.toLowerCase() === capabilityId.toLowerCase());

        if (!match) {
            throw new NotFoundError(`Capability not found: ${capabilityId}`);
        }

        return match;
    }

    async getPageByUrl(pageUrl: string) {
        const index = await this.getIndex();
        return index.pages.find((page) => page.pageUrl === pageUrl);
    }

    async getLlmByDocsUrl(pageUrl: string) {
        const index = await this.getIndex();
        const matchedPage = index.pages.find((page) => page.pageUrl === pageUrl);
        const llmUrl = matchedPage?.llmUrl ?? toLlmUrlFromDocs(pageUrl);

        return {
            llmUrl,
            page: matchedPage,
            text: await this.getLlmByUrl(llmUrl),
        };
    }

    async getLlmByUrl(llmUrl: string) {
        const cached = this.#llmCache.get(llmUrl);
        if (cached) {
            return cached;
        }

        const text = await this.#fetchText(llmUrl);
        this.#llmCache.set(llmUrl, text);
        return text;
    }

    async #fetchJson(path: string): Promise<unknown> {
        const response = await this.#fetchWithTimeout(path);
        if (!response.ok) {
            throw new UpstreamUnavailableError(`Upstream request failed: ${response.status} ${response.statusText}`, response.status);
        }

        try {
            return (await response.json()) as unknown;
        } catch {
            throw new UpstreamUnavailableError(`Invalid JSON response from ${path}`);
        }
    }

    async #fetchText(path: string) {
        const response = await this.#fetchWithTimeout(path);
        if (!response.ok) {
            throw new UpstreamUnavailableError(`Upstream request failed: ${response.status} ${response.statusText}`, response.status);
        }

        return response.text();
    }

    async #fetchWithTimeout(path: string) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.#config.timeoutMs);

        try {
            return await this.#fetchImpl(toAbsoluteUrl(this.#config.baseUrl, path), {
                signal: controller.signal,
                headers: {
                    'user-agent': '@creatorem/mcp-server',
                },
            });
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new UpstreamUnavailableError(`Timeout while requesting ${path}`);
            }

            const message = error instanceof Error ? error.message : 'Unknown fetch failure';
            throw new UpstreamUnavailableError(`Failed to request ${path}: ${message}`);
        } finally {
            clearTimeout(timeout);
        }
    }
}
