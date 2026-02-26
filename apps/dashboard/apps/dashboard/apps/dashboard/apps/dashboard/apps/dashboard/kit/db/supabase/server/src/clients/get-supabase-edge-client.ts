import 'server-only';

import { Database } from '@kit/db';
import { envs } from '@kit/supabase-server/envs';
import { createServerClient } from '@supabase/ssr';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Edge Client is used in the proxy to get the user's session.
 *
 * NOTE: This client should NOT be memoized because it depends on request-specific
 * cookies that are unique to each incoming request. Creating a new client per
 * request is the correct behavior for proxy.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {NextResponse} response - The Next.js response object.
 */
export const getSupabaseEdgeClient = (request: NextRequest, response: NextResponse) =>
    createServerClient<Database>(envs().NEXT_PUBLIC_SUPABASE_URL, envs().NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet: { name: string; value: string; options: Partial<ResponseCookie> }[]) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

                cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
            },
        },
    });
