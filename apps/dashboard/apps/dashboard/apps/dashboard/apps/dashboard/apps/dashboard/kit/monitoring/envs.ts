import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const monitoringEnvs = () => createEnv({
    server: {
        /**
         * @example my-org
         */
        SENTRY_ORG: z.string().optional(),
        /**
         * @example my-project
         */
        SENTRY_PROJECT: z.string().optional(),
        /**
         * @example sntrys_xxxx
         */
        SENTRY_AUTH_TOKEN: z.string().optional(),
    },
    client: {
        /**
         * @example https://xxxxxx.ingest.de.sentry.io/000000
         */
        NEXT_PUBLIC_SENTRY_DSN: z.string(),
    },
    runtimeEnv: {
        NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
        SENTRY_ORG: process.env.SENTRY_ORG,
        SENTRY_PROJECT: process.env.SENTRY_PROJECT,
        SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    },
    emptyStringAsUndefined: true,
})

export const envs = monitoringEnvs;
