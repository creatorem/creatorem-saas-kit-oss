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
