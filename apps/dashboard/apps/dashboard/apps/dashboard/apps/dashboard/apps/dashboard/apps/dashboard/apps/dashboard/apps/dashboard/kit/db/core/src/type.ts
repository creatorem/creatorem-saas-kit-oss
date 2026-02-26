import type { DrizzleDB } from '@kit/drizzle';
import type { createServerClient } from '@supabase/ssr';
import { UserDBClient } from './clients/user-client';
import { Database } from './database.types';

export type AppClient = {
    supabase: ReturnType<typeof createServerClient<Database>>;
    admin: DrizzleDB;
    rls: Pick<DrizzleDB, 'transaction'>;
    user: UserDBClient;
};
