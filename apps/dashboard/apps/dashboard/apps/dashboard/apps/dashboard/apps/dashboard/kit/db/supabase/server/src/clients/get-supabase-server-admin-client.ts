import 'server-only';

import { Database } from '@kit/db';
import { envs } from '@kit/supabase-server/envs';
import { createClient } from '@supabase/supabase-js';

// Memoize the admin client to prevent creating multiple connections
let adminClientInstance: ReturnType<typeof createClient<Database>> | null = null;

/**
 * @name getSupabaseServerAdminClient
 * @description Get a Supabase client for use in the Server with admin access to the database.
 * Uses memoization to reuse the same client instance and prevent connection pool exhaustion.
 */
export const getSupabaseServerAdminClient = () => {
    // Return existing admin client if already created
    if (adminClientInstance) {
        return adminClientInstance;
    }

    // Create and cache the admin client instance
    adminClientInstance = createClient<Database>(envs().NEXT_PUBLIC_SUPABASE_URL, envs().SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            persistSession: false,
            detectSessionInUrl: false,
            autoRefreshToken: false,
        },
    });

    return adminClientInstance;
};
