import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const umamiEnvs = () => createEnv({
    client: {
        NEXT_PUBLIC_UMAMI_HOST: z.string().optional(),
        NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
        NEXT_PUBLIC_UMAMI_DISABLE_LOCALHOST_TRACKING: z.string().optional(),
    },
    server: {},
    runtimeEnv: {
        NEXT_PUBLIC_UMAMI_HOST: process.env.NEXT_PUBLIC_UMAMI_HOST,
        NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
        NEXT_PUBLIC_UMAMI_DISABLE_LOCALHOST_TRACKING: process.env.NEXT_PUBLIC_UMAMI_DISABLE_LOCALHOST_TRACKING,
    },
    emptyStringAsUndefined: true,
})

export const envs = umamiEnvs;
