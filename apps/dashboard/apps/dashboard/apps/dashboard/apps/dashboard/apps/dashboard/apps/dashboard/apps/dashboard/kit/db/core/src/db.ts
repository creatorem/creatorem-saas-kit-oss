import 'server-only';

import { envs } from '@kit/db/envs';
import type { DrizzleDB } from '@kit/drizzle';
import * as schema from '@kit/drizzle';
import type { createServerClient } from '@supabase/ssr';
import { DrizzleConfig } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import postgres from 'postgres';
import { UserDBClient } from './clients/user-client';
import { Database } from './database.types';
import { createRLSDrizzle } from './drizzle-rls';
import { AppClient } from './type';

const config = {
    casing: 'snake_case',
    schema,
} satisfies DrizzleConfig<typeof schema>;

// Admin client bypasses RLS
const adminClient = drizzle({
    client: postgres(envs().SUPABASE_DATABASE_URL, { prepare: false }),
    connection: {
        ssl: true,
    },
    ...config,
});

// RLS protected client
const rlsClient = drizzle({
    client: postgres(envs().SUPABASE_DATABASE_URL, { prepare: false }),
    connection: {
        ssl: true,
    },
    ...config,
});

// https://github.com/orgs/supabase/discussions/23224
// Should be secure because we use the access token that is signed, and not the data read directly from the storage
export async function getDrizzleSupabaseClient(
    supabaseClient: ReturnType<typeof createServerClient<Database>>,
    jwt?: string,
): Promise<AppClient> {
    const {
        data: { session },
    } = await supabaseClient.auth.getSession();
    const token = decode(jwt ?? session?.access_token ?? '');
    const dbBase: Omit<AppClient, 'user'> = {
        supabase: supabaseClient,
        admin: adminClient as unknown as DrizzleDB,
        rls: createRLSDrizzle(token, rlsClient),
    };

    // Initialize base client with user client
    const baseClient: AppClient = {
        ...dbBase,
        user: new UserDBClient(dbBase),
    };

    return baseClient;
}

function decode(accessToken: string) {
    try {
        return jwtDecode<JwtPayload & { role: string }>(accessToken);
    } catch {
        return { role: 'anon' } as JwtPayload & { role: string };
    }
}
