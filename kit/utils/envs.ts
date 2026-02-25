import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const utilsEnvs = () => createEnv({
    clientPrefix: 'NEXT_PUBLIC',
    client: {
        /**
         * @default "Your name"
         */
        NEXT_PUBLIC_APP_NAME: z.string(),
    },
    runtimeEnv: {
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    },
    emptyStringAsUndefined: true,
})

export const utilsRouteEnvs = () => createEnv({
    clientPrefix: 'NEXT_PUBLIC',
    client: {
        /**
         * @default "http://localhost:3001"
         */
        NEXT_PUBLIC_MARKETING_URL: z.string().url(),
        /**
         * @default "http://localhost:3000"
         */
        NEXT_PUBLIC_DASHBOARD_URL: z.string().url(),
    },
    server: {},
    runtimeEnv: {
        NEXT_PUBLIC_MARKETING_URL: process.env.NEXT_PUBLIC_MARKETING_URL,
        NEXT_PUBLIC_DASHBOARD_URL: process.env.NEXT_PUBLIC_DASHBOARD_URL,
    },
    emptyStringAsUndefined: true,
})

export const envs = utilsRouteEnvs
