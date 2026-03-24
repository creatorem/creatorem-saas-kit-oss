import { ValidationError } from './errors.js';

export function normalizeDocsUrl(input: string) {
    const raw = input.trim();
    if (raw.length === 0) {
        throw new ValidationError('"pageUrl" cannot be empty.');
    }

    let pathname = raw;
    if (/^https?:\/\//i.test(raw)) {
        let parsed: URL;
        try {
            parsed = new URL(raw);
        } catch {
            throw new ValidationError('"pageUrl" must be a valid /docs URL or absolute HTTP(S) URL.');
        }
        pathname = parsed.pathname;
    }

    if (!pathname.startsWith('/docs')) {
        throw new ValidationError('"pageUrl" must start with "/docs".');
    }

    const normalized = pathname.replace(/\/$/, '');
    return normalized === '' ? '/docs' : normalized;
}

export function toLlmUrlFromDocs(docsUrl: string) {
    const normalizedDocsUrl = normalizeDocsUrl(docsUrl);

    if (normalizedDocsUrl === '/docs') {
        return '/llms.mdx';
    }

    return `/llms.mdx${normalizedDocsUrl.slice('/docs'.length)}`;
}
