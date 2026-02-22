import { utilsEnvs } from '@kit/utils/envs';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const supabaseEnvs = {
    client: {
        next: () => createEnv({
        clientPrefix: 'NEXT_PUBLIC',
            client: {
                /**
                 * 📡 API URL - Your Supabase project endpoint
                 * Get from: Supabase Dashboard > Settings > API > Project URL
                 */
                NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
                /**
                 * 🔑 ANON KEY - Public key for client-side auth (safe to expose)
                 * Get from: Supabase Dashboard > Settings > API > anon public
                 */
                NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
            },
            runtimeEnv: {
                NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
                NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            },
            emptyStringAsUndefined: true,
        }),
    },
    server: () => createEnv({
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
}

export const envs = () =>
    createEnv({
        extends: [utilsEnvs(),supabaseEnvs.client.next(), supabaseEnvs.server()],
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
