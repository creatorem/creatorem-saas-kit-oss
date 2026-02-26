import { utilsRouteEnvs } from '@kit/utils/envs';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const envs = () =>
    createEnv({
        extends: [utilsRouteEnvs],
        runtimeEnv: {},
        emptyStringAsUndefined: true,
    });
