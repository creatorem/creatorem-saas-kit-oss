import type { McpCapability } from './types.js';

function includesTerm(value: string | undefined, query: string) {
    return value?.toLowerCase().includes(query) ?? false;
}

function includesArray(values: string[] | undefined, query: string) {
    return values?.some((value) => value.toLowerCase().includes(query)) ?? false;
}

export function scoreCapabilityForQuery(capability: McpCapability, query: string) {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length === 0) {
        return 0;
    }

    const id = capability.id.toLowerCase();
    const title = capability.title.toLowerCase();

    let score = 0;

    if (id === normalizedQuery) score += 260;
    else if (id.startsWith(normalizedQuery)) score += 120;
    else if (id.includes(normalizedQuery)) score += 75;

    if (title === normalizedQuery) score += 45;
    else if (title.includes(normalizedQuery)) score += 35;

    if (includesTerm(capability.description, normalizedQuery)) score += 18;
    if (includesArray(capability.aliases, normalizedQuery)) score += 28;
    if (includesArray(capability.tags, normalizedQuery)) score += 20;
    if (includesTerm(capability.status, normalizedQuery)) score += 8;

    return score;
}

export function searchCapabilities(capabilities: McpCapability[], query: string) {
    const normalizedQuery = query.trim().toLowerCase();

    return capabilities
        .map((capability) => ({
            capability,
            score: scoreCapabilityForQuery(capability, normalizedQuery),
        }))
        .filter((entry) => entry.score > 0)
        .sort((left, right) => {
            if (left.score !== right.score) {
                return right.score - left.score;
            }

            return left.capability.id.localeCompare(right.capability.id);
        });
}
