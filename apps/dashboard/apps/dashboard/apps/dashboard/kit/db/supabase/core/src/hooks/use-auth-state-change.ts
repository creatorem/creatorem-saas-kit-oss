'use client';

import { Database } from '@kit/db';
import type { AuthChangeEvent, Session, SupabaseClient } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useSupabase } from './use-supabase';

export type AuthConfigScopePatterns = {
    auth: string;
    private: string;
};

export function useAuthStateChange({
    supabase,
    scopePatterns,
    onEvent,
}: {
    scopePatterns: AuthConfigScopePatterns;
    supabase?: SupabaseClient<Database>;
    onEvent?: (event: AuthChangeEvent, user: Session | null) => void;
}) {
    const webClient = useSupabase();
    const client = useMemo(() => supabase ?? webClient, [supabase, webClient]);
    if (!client) {
        throw new Error(
            'Supabase client is not initialized. You must not have set the NEXT_PUBLIC_SUPABASE_... keys in your environment variables.',
        );
    }
    const pathName = usePathname();

    useEffect(() => {
        const listener = client.auth.onAuthStateChange((event, user) => {
            if (onEvent) {
                onEvent(event, user);
            }

            const shouldRedirectUser = !user && isPrivateRoute(pathName, scopePatterns.private);

            if (shouldRedirectUser) {
                window.location.assign('/');
                return;
            }

            if (event === 'SIGNED_OUT') {
                if (isAuthRoute(pathName, scopePatterns.auth)) {
                    return;
                }

                window.location.reload();
            }
        });

        return () => {
            listener.data.subscription.unsubscribe();
        };
    }, [client.auth, pathName, scopePatterns, onEvent]);
}

/**
 * Determines if a given path matches a URL pattern.
 * Supports basic wildcard patterns like '/auth/*?' and '/(dashboard|onboarding)/*?'
 */
function matchesUrlPattern(path: string, pattern: string): boolean {
    if (!pattern || !path) return false;

    const input = path.split('?')[0]; // Remove query parameters
    if (!input) return false;

    // Convert URL pattern to regex
    // '/auth/*?' -> ^\/auth\/.*$
    // '/(dashboard|onboarding)/*?' -> ^\/(dashboard|onboarding)\/.*$
    const regexPattern: string = pattern
        .replace(/\*/g, '.*') // * becomes .*
        .replace(/\?/g, '.') // ? becomes .
        .replace(/\//g, '\\/'); // / becomes \/

    if (!regexPattern) return false;

    try {
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(input);
    } catch {
        // If regex is invalid, fall back to simple string matching
        return path.startsWith(pattern.replace('/*?', '').replace('/(?', ''));
    }
}

/**
 * Determines if a given path is a private route.
 */
function isPrivateRoute(path: string, privatePattern: string): boolean {
    return matchesUrlPattern(path, privatePattern);
}

/**
 * Determines if a given path is an auth route.
 */
function isAuthRoute(path: string, authPattern: string): boolean {
    return matchesUrlPattern(path, authPattern);
}
