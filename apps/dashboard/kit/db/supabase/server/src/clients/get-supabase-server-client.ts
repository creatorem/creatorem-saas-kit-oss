import 'server-only';

import { Database } from '@kit/db';
import { envs } from '@kit/supabase-server/envs';
import { createServerClient } from '@supabase/ssr';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';
import { cache } from 'react';

/**
 * @name getSupabaseServerClient
 * @description Creates a Supabase client for use in the Server.
 * Uses React cache() to memoize the client per request, preventing multiple
 * client creations within the same request while still allowing request-specific cookies.
 */
export const getSupabaseServerClient = cache((jwt?: string): ReturnType<typeof createServerClient<Database>> => {
    return createServerClient<Database>(envs().NEXT_PUBLIC_SUPABASE_URL, envs().NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            async getAll() {
                const cookieStore = await cookies();

                return cookieStore.getAll();
            },
            async setAll(cookiesToSet: { name: string; value: string; options: Partial<ResponseCookie> }[]) {
                const cookieStore = await cookies();

                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have proxy refreshing
                    // user sessions.
                }
            },
        },
        global: jwt
            ? {
                  headers: {
                      Authorization: `Bearer ${jwt}`,
                  },
              }
            : undefined,
    });
});
