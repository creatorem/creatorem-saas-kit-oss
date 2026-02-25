import { createEnv } from '@t3-oss/env-nextjs';
import { utilsEnvs } from '@kit/utils/envs';
import { sharedRouteEnvs } from '@kit/shared/envs';
import { emailerEnvs } from '@kit/emailer/envs';
import { supabaseServerEnvs } from '@kit/supabase-server/envs';
import { wwwSupabaseClientEnvs } from '@kit/supabase-client/envs';

export const envs = () =>
    createEnv({
        extends: [
            utilsEnvs(),
            sharedRouteEnvs(),
            wwwSupabaseClientEnvs(),
            supabaseServerEnvs(),
            emailerEnvs(),
        ],
        runtimeEnv: {},
        emptyStringAsUndefined: true,
    });
