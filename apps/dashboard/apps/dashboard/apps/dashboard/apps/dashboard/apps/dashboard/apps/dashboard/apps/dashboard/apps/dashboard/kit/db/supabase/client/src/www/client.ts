import { Database } from '@kit/db';
import { envs } from '@kit/supabase-client/envs';
import { createBrowserClient } from '@supabase/ssr';

// Memoize the Supabase client to prevent creating multiple connections
let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * @name getSupabaseHookableClient
 * @description Get a Supabase client for use in the Browser
 * Uses memoization to reuse the same client instance and prevent connection pool exhaustion
 */
export const getSupabaseClient = () => {
    // Return existing client if already created
    if (clientInstance) {
        return clientInstance;
    }

    // @todo: throw error when value returned by getSupabaseHookableClient is null in nextjs environment
    if (!envs.www().NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
    }

    if (!envs.www().NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    }

    const client = createBrowserClient<Database>(
        envs.www().NEXT_PUBLIC_SUPABASE_URL,
        envs.www().NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    if (!client) {
        throw new Error('Failed to create Supabase client');
    }

    // Cache the client instance
    clientInstance = client;

    return client;
};
