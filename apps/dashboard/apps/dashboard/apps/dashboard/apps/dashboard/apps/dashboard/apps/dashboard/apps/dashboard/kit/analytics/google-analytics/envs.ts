import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const googleAnalyticsEnvs = () => createEnv({
    client: {
        NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
        /**
         * @default false
         */
        NEXT_PUBLIC_GA_DISABLE_LOCALHOST_TRACKING: z.string().optional(),
        /**
         * @default false
         */
        NEXT_PUBLIC_GA_DISABLE_PAGE_VIEWS_TRACKING: z.string().optional(),
    },
    server: {},
    runtimeEnv: {
        NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
        NEXT_PUBLIC_GA_DISABLE_LOCALHOST_TRACKING: process.env.NEXT_PUBLIC_GA_DISABLE_LOCALHOST_TRACKING,
        NEXT_PUBLIC_GA_DISABLE_PAGE_VIEWS_TRACKING: process.env.NEXT_PUBLIC_GA_DISABLE_PAGE_VIEWS_TRACKING,
    },
    emptyStringAsUndefined: true,
})

export const envs = googleAnalyticsEnvs
