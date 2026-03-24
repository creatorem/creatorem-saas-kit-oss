import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeDocsUrl, toLlmUrlFromDocs } from '../src/url-utils.js';

test('normalizeDocsUrl keeps /docs root', () => {
    assert.equal(normalizeDocsUrl('/docs'), '/docs');
});

test('normalizeDocsUrl removes trailing slash', () => {
    assert.equal(normalizeDocsUrl('/docs/web/'), '/docs/web');
});

test('normalizeDocsUrl accepts absolute URL', () => {
    assert.equal(normalizeDocsUrl('https://creatorem.com/docs/web/features/settings'), '/docs/web/features/settings');
});

test('normalizeDocsUrl rejects non-docs path', () => {
    assert.throws(() => normalizeDocsUrl('/web/features/settings'));
});

test('toLlmUrlFromDocs maps docs root', () => {
    assert.equal(toLlmUrlFromDocs('/docs'), '/llms.mdx');
});

test('toLlmUrlFromDocs maps docs nested page', () => {
    assert.equal(toLlmUrlFromDocs('/docs/web/features/settings'), '/llms.mdx/web/features/settings');
});
