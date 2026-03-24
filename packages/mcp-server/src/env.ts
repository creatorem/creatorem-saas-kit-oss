import type { ServerConfig } from './types.js';

const DEFAULT_BASE_URL = 'https://creatorem.com';
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_CACHE_TTL_MS = 60_000;

function parsePositiveInt(raw: string | undefined, fallback: number) {
    if (!raw) {
        return fallback;
    }

    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }

    return parsed;
}

function normalizeBaseUrl(raw: string | undefined) {
    const fallback = DEFAULT_BASE_URL;
    const value = raw?.trim() || fallback;

    let url: URL;
    try {
        url = new URL(value);
    } catch {
        return fallback;
    }

    if (!['http:', 'https:'].includes(url.protocol)) {
        return fallback;
    }

    return url.origin.replace(/\/$/, '');
}

export function readServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
    return {
        baseUrl: normalizeBaseUrl(env.CREATOREM_MCP_BASE_URL),
        timeoutMs: parsePositiveInt(env.CREATOREM_MCP_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
        cacheTtlMs: parsePositiveInt(env.CREATOREM_MCP_CACHE_TTL_MS, DEFAULT_CACHE_TTL_MS),
    };
}
