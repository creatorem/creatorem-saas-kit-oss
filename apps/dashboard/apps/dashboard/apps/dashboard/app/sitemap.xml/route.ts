import { dashboardRoutes } from '@kit/utils/config';
import { getServerSideSitemap } from 'next-sitemap';

/**
 * @description The maximum age of the sitemap in seconds.
 * This is used to set the cache-control header for the sitemap. The cache-control header is used to control how long the sitemap is cached.
 */
const MAX_AGE = 60;
const S_MAX_AGE = 3600;

export async function GET() {
    const items = getStaticSitemapItems();

    const headers = {
        'Cache-Control': `public, max-age=${MAX_AGE}, s-maxage=${S_MAX_AGE}`,
    };

    return getServerSideSitemap(items, headers);
}

type SitemapItem = { loc: string; lastmod: string };

function getStaticSitemapItems(): SitemapItem[] {
    const baseUrl = String(dashboardRoutes.url);
    const now = new Date().toISOString();
    const paths = collectStaticPaths(dashboardRoutes.paths)
        // exclude API endpoints from sitemap
        .filter((route) => !route.startsWith('/api'));

    const uniquePaths = Array.from(new Set(paths));

    return uniquePaths.map((route: string) => ({
        loc: new URL(route, baseUrl).href,
        lastmod: now,
    }));
}

function collectStaticPaths(input: unknown): string[] {
    if (typeof input === 'string') {
        // exclude dynamic routes like /dashboard/[slug]
        if (input.includes('[')) return [];
        if (!input.startsWith('/')) return [];
        return [input];
    }

    if (input && typeof input === 'object') {
        return Object.values(input as Record<string, unknown>).flatMap((value) => collectStaticPaths(value));
    }

    return [];
}
