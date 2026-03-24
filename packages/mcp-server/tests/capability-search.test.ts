import assert from 'node:assert/strict';
import test from 'node:test';

import { scoreCapabilityForQuery, searchCapabilities } from '../src/capability-search.js';
import type { McpCapability } from '../src/types.js';

const capability: McpCapability = {
    id: 'settings_api',
    title: 'Settings API',
    description: 'Read and update user or organization settings',
    pageUrl: '/docs/web/features/settings',
    llmUrl: '/llms.mdx/web/features/settings',
    sourcePath: 'web/features/settings/index.mdx',
    relatedPageUrls: [],
    entrypoints: ['kit/settings'],
    inputs: ['setting_keys'],
    outputs: ['setting_values'],
    constraints: ['requires auth'],
    sideEffects: ['updates db'],
    aliases: ['settings', 'user_settings'],
    tags: ['settings', 'config'],
    status: 'stable',
};

test('exact id match scores higher than generic match', () => {
    const exactScore = scoreCapabilityForQuery(capability, 'settings_api');
    const genericScore = scoreCapabilityForQuery(capability, 'settings');

    assert.ok(exactScore > genericScore);
});

test('searchCapabilities returns sorted matches with positive scores', () => {
    const other: McpCapability = {
        ...capability,
        id: 'billing',
        title: 'Billing',
        description: 'Billing plans and subscriptions',
        aliases: ['payments'],
        tags: ['billing'],
    };

    const results = searchCapabilities([other, capability], 'settings');

    assert.equal(results.length, 1);
    assert.equal(results[0]?.capability.id, 'settings_api');
    assert.ok(results[0]?.score && results[0].score > 0);
});
