import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const nativeAuthEnvs = createEnv({
    clientPrefix: 'EXPO_PUBLIC_',
    client: {
        EXPO_PUBLIC_SUPABASE_GOOGLE_CLIENT_ID: z.string().min(1),
    },
    runtimeEnv: {
        EXPO_PUBLIC_SUPABASE_GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_SUPABASE_GOOGLE_CLIENT_ID,
    },
    emptyStringAsUndefined: true,
})

export const wwwAuthEnvs = createEnv({
    clientPrefix: 'NEXT_PUBLIC_',
    client: {},
    server: {
        CAPTCHA_SECRET_KEY: z.string().optional(),
        AUTH_WEBHOOK_SECRET: z.string().min(1),
    },
    runtimeEnv: {
        CAPTCHA_SECRET_KEY: process.env.CAPTCHA_SECRET_KEY,
        AUTH_WEBHOOK_SECRET: process.env.AUTH_WEBHOOK_SECRET,
    },
    emptyStringAsUndefined: true,
})

export const envs = {
    /**
     * @name native Used in the src/native folder
     * @description Get the keys for the native environment
     */
    native: () => nativeAuthEnvs,

    /**
     * @name web Used in the src/www folder
     * @description Get the keys for the web environment
     */
    www: () => wwwAuthEnvs,
};
