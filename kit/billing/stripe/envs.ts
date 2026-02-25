import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const stripeEnvs = () => createEnv({
    client: {
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    },
    server: {
        STRIPE_SECRET_KEY: z.string().optional(),
        /**
         * @example whsec_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
         */
        STRIPE_WEBHOOK_SECRET: z.string().optional(),
    },
    runtimeEnv: {
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    },
    emptyStringAsUndefined: true,
})

export const envs = stripeEnvs
