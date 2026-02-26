import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const envs = () =>
    createEnv({
        client: {},
        server: {
            /**
             * 🗄️ DATABASE URL - Direct PostgreSQL connection for migrations & Drizzle
             * Get from: Supabase Dashboard > Settings > Database > Connection string > URI
             */
            SUPABASE_DATABASE_URL: z.string().url(),
        },
        runtimeEnv: {
            SUPABASE_DATABASE_URL: process.env.SUPABASE_DATABASE_URL,
        },
        emptyStringAsUndefined: true,
    });
