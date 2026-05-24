const INVALID_SUFFIXES = ['/rest/v1', '/auth/v1'];

/**
 * Supabase JS expects the project base URL (https://<ref>.supabase.co),
 * not REST or Auth endpoint URLs.
 */
export function normalizeSupabaseUrl(rawUrl: string) {
    const trimmed = rawUrl.trim().replace(/\/+$/, '');
    const lower = trimmed.toLowerCase();

    for (const suffix of INVALID_SUFFIXES) {
        if (lower.endsWith(suffix)) {
            return trimmed.slice(0, -suffix.length);
        }
    }

    return trimmed;
}

