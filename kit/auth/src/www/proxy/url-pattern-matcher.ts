import { NextRequest, NextResponse } from 'next/server';
import type { AuthConfig } from '../../config';

export type PatternHandler = (
    req: NextRequest,
    res: NextResponse,
    authConfig: AuthConfig,
) => Promise<NextResponse | undefined>;

export interface PatternHandlerConfig {
    pattern: string;
    handler: PatternHandler;
}

/**
 * Match URL patterns to specific handlers.
 * @param pathname - The pathname to match against patterns
 * @param patterns - Array of pattern configurations with handlers
 * @returns The matching handler function, or undefined if no match
 */
export function matchUrlPattern(pathname: string, patterns: PatternHandlerConfig[]): PatternHandler | undefined {
    for (const { pattern, handler } of patterns) {
        // Convert pattern like "/auth/*?" to regex
        // "/auth/*?" -> ^/auth(/.*)?$
        // "/(dashboard|onboarding)/*?" -> ^/(dashboard|onboarding)(/.*)?$
        // "/api/*/users/*" -> ^/api/[^/]+/users/.*$
        let regexPattern = pattern;

        // Handle the special case where pattern ends with /*? (optional trailing path)
        if (regexPattern.endsWith('/*?')) {
            regexPattern = `${regexPattern.slice(0, -3)}(/.*)?`;
        } else {
            // Replace wildcard patterns first, before escaping
            // Handle /* at the end - should match anything after the slash (including empty)
            regexPattern = regexPattern.replace(/\/\*$/, '/.*');
            // Handle * between slashes - should match any single path segment
            regexPattern = regexPattern.replace(/\/\*(?=\/)/g, '/[^/]*');
            // Handle * at the very end - should match everything
            regexPattern = regexPattern.replace(/\*$/, '.*');
            // Any remaining * should match everything within a segment
            regexPattern = regexPattern.replace(/\*/g, '[^/]*');

            // Remove optional ? suffix
            regexPattern = regexPattern.replace(/\?/g, '');
        }

        // Now escape forward slashes for regex
        regexPattern = regexPattern.replace(/\//g, '\\/');

        const regex = new RegExp(`^${regexPattern}$`);

        // Debug logging (remove in production)
        // console.log(`Pattern: ${pattern} -> Regex: ${regexPattern} -> Testing: ${pathname} -> Match: ${regex.test(pathname)}`);

        if (regex.test(pathname)) {
            return handler;
        }
    }

    return undefined;
}
