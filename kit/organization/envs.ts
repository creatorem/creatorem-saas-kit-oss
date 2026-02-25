import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const nativeOrganizationEnvs = () => createEnv({
    clientPrefix: 'EXPO_PUBLIC_',
    client: {
        EXPO_PUBLIC_DASHBOARD_URL: z.string().url(),
    },
    server: {},
    runtimeEnv: {
        EXPO_PUBLIC_DASHBOARD_URL: process.env.EXPO_PUBLIC_DASHBOARD_URL,
    },
    emptyStringAsUndefined: true,
})

export const wwwOrganizationEnvs = () => createEnv({
    clientPrefix: 'NEXT_PUBLIC_',
    client: {
        NEXT_PUBLIC_DASHBOARD_URL: z.string().min(1),
    },
    server: {},
    runtimeEnv: {
        NEXT_PUBLIC_DASHBOARD_URL: process.env.NEXT_PUBLIC_DASHBOARD_URL,
    },
    emptyStringAsUndefined: true,
})

export const envs = {
    /**
     * @name native Used in the src/native folder
     * @description Get the keys for the native environment
     */
    native: nativeOrganizationEnvs,

    /**
     * @name web Used in the src/www folder
     * @description Get the keys for the web environment
     */
    www: wwwOrganizationEnvs,
};
