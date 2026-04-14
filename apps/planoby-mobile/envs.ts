import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const envs = () =>
    createEnv({
        clientPrefix: 'EXPO_PUBLIC_',
        extends: [
            // analytics(),
            // auth(),
            // billing(),
            // database(),
            // email(),
            // monitoring(),
            // routes()
        ],
        client: {
            /**
             * Get your ios url schema from the google cloud console
             * 
             * @default "com.googleusercontent.apps.test"
             */
            EXPO_PUBLIC_IOS_URL_SCHEMA: z.string().min(1), // disabled for now
            EXPO_PUBLIC_DEFAULT_LOCALE: z.string().min(1),
            EXPO_PUBLIC_DASHBOARD_URL: z.string().url(),
            EXPO_PUBLIC_MARKETING_URL: z.string().url(),
        },
        server: {},
        runtimeEnv: {
            EXPO_PUBLIC_DEFAULT_LOCALE: process.env.EXPO_PUBLIC_DEFAULT_LOCALE,
            EXPO_PUBLIC_IOS_URL_SCHEMA: process.env.EXPO_PUBLIC_IOS_URL_SCHEMA,
            EXPO_PUBLIC_DASHBOARD_URL: process.env.EXPO_PUBLIC_DASHBOARD_URL,
            EXPO_PUBLIC_MARKETING_URL: process.env.EXPO_PUBLIC_MARKETING_URL,
        },
        emptyStringAsUndefined: true,
    });
