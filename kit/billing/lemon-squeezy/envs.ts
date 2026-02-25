import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const lemonSqueezyEnvs = () => createEnv({
    client: {},
    server: {
        LEMON_SQUEEZY_SECRET_KEY: z.string().min(1),
        LEMON_SQUEEZY_SIGNING_SECRET:
            process.env.NODE_ENV === 'production'
                ? z
                    .string({
                        description: 'Created when adding a webhook to your store',
                    })
                    .min(1)
                : z.string().optional(),
        LEMON_SQUEEZY_STORE_ID: z.string().min(1),
    },
    runtimeEnv: {
        LEMON_SQUEEZY_SECRET_KEY: process.env.LEMON_SQUEEZY_SECRET_KEY,
        LEMON_SQUEEZY_SIGNING_SECRET: process.env.LEMON_SQUEEZY_SIGNING_SECRET,
        LEMON_SQUEEZY_STORE_ID: process.env.LEMON_SQUEEZY_STORE_ID,
    },
    emptyStringAsUndefined: true,
})

export const envs = lemonSqueezyEnvs
