import { utilsEnvs } from '@kit/utils/envs';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
// from the @kit/supabase-client package
import { wwwSupabaseClientEnvs } from '../client/envs'

export const supabaseServerEnvs = () => createEnv({
    server: {
        /**
         * 🚨 SERVICE ROLE - Server-only key with full DB access (NEVER expose to client!)
         * Get from: Supabase Dashboard > Settings > API > service_role secret
         */
        SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
        /**
         * 🗄️ DATABASE URL - Direct PostgreSQL connection for migrations & Drizzle
         * Get from: Supabase Dashboard > Settings > Database > Connection string > URI
         */
        SUPABASE_DATABASE_URL: z.string().url(),
    },
    runtimeEnv: {
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        SUPABASE_DATABASE_URL: process.env.SUPABASE_DATABASE_URL,
    },
    emptyStringAsUndefined: true,
})

export const envs = () =>
    createEnv({
        extends: [utilsEnvs(), supabaseServerEnvs(), wwwSupabaseClientEnvs()],
        clientPrefix: 'NEXT_PUBLIC',
        client: {},
        server: {
            EMAIL_FROM: z.string(),
        },
        runtimeEnv: {
            EMAIL_FROM: process.env.EMAIL_FROM,
        },
        emptyStringAsUndefined: true,
    });
