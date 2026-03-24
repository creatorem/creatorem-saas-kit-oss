import { searchCapabilities } from './capability-search.js';
import { DocsClient } from './docs-client.js';
import { NotFoundError, UpstreamUnavailableError, ValidationError } from './errors.js';
import { normalizeDocsUrl } from './url-utils.js';
import type { JsonObject, McpCapability, ToolDefinition, ToolResult } from './types.js';

type ToolHandler = (args: unknown) => Promise<ToolResult>;

const MAX_LIMIT = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function asObject(value: unknown): Record<string, unknown> {
    if (!isRecord(value)) {
        return {};
    }

    return value;
}

function readOptionalString(record: Record<string, unknown>, key: string) {
    const value = record[key];
    if (value === undefined || value === null) {
        return undefined;
    }

    if (typeof value !== 'string') {
        throw new ValidationError(`"${key}" must be a string.`);
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function readRequiredString(record: Record<string, unknown>, key: string) {
    const value = readOptionalString(record, key);
    if (!value) {
        throw new ValidationError(`"${key}" is required.`);
    }

    return value;
}

function readOptionalStringArray(record: Record<string, unknown>, key: string) {
    const value = record[key];
    if (value === undefined || value === null) {
        return undefined;
    }

    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
        throw new ValidationError(`"${key}" must be an array of strings.`);
    }

    return value.map((item) => item.trim()).filter(Boolean);
}

function readOptionalInt(record: Record<string, unknown>, key: string, fallback: number) {
    const value = record[key];
    if (value === undefined || value === null) {
        return fallback;
    }

    if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw new ValidationError(`"${key}" must be an integer.`);
    }

    return Math.min(Math.max(1, value), MAX_LIMIT);
}

function capabilitySummary(capability: McpCapability) {
    return {
        id: capability.id,
        title: capability.title,
        description: capability.description,
        pageUrl: capability.pageUrl,
        llmUrl: capability.llmUrl,
        tags: capability.tags ?? [],
        aliases: capability.aliases ?? [],
        status: capability.status,
    } as const;
}

function textResult(data: JsonObject): ToolResult {
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(data, null, 2),
            },
        ],
        structuredContent: data,
    };
}

function errorResult(code: string, message: string, details?: JsonObject): ToolResult {
    const payload: JsonObject = {
        ok: false,
        error: {
            code,
            message,
            ...(details ? { details } : {}),
        },
    };

    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(payload, null, 2),
            },
        ],
        structuredContent: payload,
        isError: true,
    };
}

function mapToolError(error: unknown): ToolResult {
    if (error instanceof ValidationError) {
        return errorResult('INVALID_INPUT', error.message);
    }

    if (error instanceof NotFoundError) {
        return errorResult('NOT_FOUND', error.message);
    }

    if (error instanceof UpstreamUnavailableError) {
        const details = error.status ? { status: error.status } : undefined;
        return errorResult('UPSTREAM_UNAVAILABLE', error.message, details);
    }

    const message = error instanceof Error ? error.message : 'Unknown tool error';
    return errorResult('UNKNOWN_ERROR', message);
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
    {
        name: 'creatorem.list_capabilities',
        description: 'List Creatorem documentation capabilities from mcp-index.json.',
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            properties: {
                query: { type: 'string', description: 'Optional free-text query for ranking/filtering.' },
                tags: { type: 'array', items: { type: 'string' }, description: 'Optional tags filter (any match).' },
                status: { type: 'string', description: 'Optional status filter.' },
                limit: { type: 'integer', minimum: 1, maximum: MAX_LIMIT, description: 'Max rows to return.' },
            },
        },
    },
    {
        name: 'creatorem.get_capability',
        description: 'Get a single capability by ID with related page metadata.',
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            required: ['capabilityId'],
            properties: {
                capabilityId: { type: 'string', description: 'Capability identifier from mcp-index.json.' },
            },
        },
    },
    {
        name: 'creatorem.get_page_content',
        description: 'Fetch LLM-ready page content for a given /docs URL.',
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            required: ['pageUrl'],
            properties: {
                pageUrl: { type: 'string', description: 'Docs page URL such as /docs/web/features/settings.' },
            },
        },
    },
    {
        name: 'creatorem.search_capabilities',
        description: 'Search capabilities by ID/title/description/tags/aliases with scoring.',
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            required: ['query'],
            properties: {
                query: { type: 'string', description: 'Search query.' },
                limit: { type: 'integer', minimum: 1, maximum: MAX_LIMIT, description: 'Max rows to return.' },
            },
        },
    },
];

export function createToolHandlers(client: DocsClient): Record<string, ToolHandler> {
    return {
        'creatorem.list_capabilities': async (args) => {
            const input = asObject(args);
            const query = readOptionalString(input, 'query');
            const tags = readOptionalStringArray(input, 'tags')?.map((item) => item.toLowerCase());
            const status = readOptionalString(input, 'status')?.toLowerCase();
            const limit = readOptionalInt(input, 'limit', 50);

            const index = await client.getIndex();
            let capabilities = [...index.capabilities];

            if (tags && tags.length > 0) {
                capabilities = capabilities.filter((capability) => {
                    const capabilityTags = (capability.tags ?? []).map((tag) => tag.toLowerCase());
                    return tags.some((tag) => capabilityTags.includes(tag));
                });
            }

            if (status) {
                capabilities = capabilities.filter(
                    (capability) => capability.status && capability.status.toLowerCase() === status,
                );
            }

            if (query) {
                const ranked = searchCapabilities(capabilities, query).slice(0, limit);
                return textResult({
                    ok: true,
                    query,
                    total: capabilities.length,
                    count: ranked.length,
                    generatedAt: index.generatedAt,
                    capabilities: ranked.map((entry) => ({
                        ...capabilitySummary(entry.capability),
                        score: entry.score,
                    })),
                });
            }

            const rows = capabilities
                .sort((left, right) => left.id.localeCompare(right.id))
                .slice(0, limit)
                .map(capabilitySummary);

            return textResult({
                ok: true,
                total: capabilities.length,
                count: rows.length,
                generatedAt: index.generatedAt,
                capabilities: rows,
            });
        },

        'creatorem.get_capability': async (args) => {
            const input = asObject(args);
            const capabilityId = readRequiredString(input, 'capabilityId');
            const capability = await client.getCapability(capabilityId);
            const index = await client.getIndex();
            const relatedPages = index.pages.filter((page) => capability.relatedPageUrls.includes(page.pageUrl));

            return textResult({
                ok: true,
                capability,
                relatedPages,
            });
        },

        'creatorem.get_page_content': async (args) => {
            const input = asObject(args);
            const pageUrl = normalizeDocsUrl(readRequiredString(input, 'pageUrl'));
            const payload = await client.getLlmByDocsUrl(pageUrl);

            return textResult({
                ok: true,
                pageUrl,
                llmUrl: payload.llmUrl,
                page: payload.page
                    ? {
                          title: payload.page.title,
                          description: payload.page.description,
                          sourcePath: payload.page.sourcePath,
                          capability: payload.page.capability,
                      }
                    : undefined,
                content: payload.text,
            });
        },

        'creatorem.search_capabilities': async (args) => {
            const input = asObject(args);
            const query = readRequiredString(input, 'query');
            const limit = readOptionalInt(input, 'limit', 10);
            const index = await client.getIndex();
            const matches = searchCapabilities(index.capabilities, query).slice(0, limit);

            return textResult({
                ok: true,
                query,
                count: matches.length,
                capabilities: matches.map((entry) => ({
                    ...capabilitySummary(entry.capability),
                    score: entry.score,
                })),
            });
        },
    };
}

export async function callTool(handlers: Record<string, ToolHandler>, name: string, args: unknown) {
    const handler = handlers[name];
    if (!handler) {
        return errorResult('NOT_FOUND', `Tool not found: ${name}`);
    }

    try {
        return await handler(args);
    } catch (error) {
        return mapToolError(error);
    }
}
