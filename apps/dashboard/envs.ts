import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';
import { supabaseEnvs } from '@kit/supabase-server/envs';
import { monitoringEnvs } from '@kit/monitoring/envs';
import { utilsEnvs, utilsRouteEnvs } from '@kit/utils/envs';
import { googleAnalyticsEnvs } from '@kit/analytics/envs';

export const envs = () =>
    createEnv({
        extends: [
            utilsEnvs(),
            utilsRouteEnvs(),
            supabaseEnvs.client.next(),
            supabaseEnvs.server(),
            monitoringEnvs(),
            googleAnalyticsEnvs()
        ],
        client: {
            /**
             * You can get one here : https://cloud.google.com/security/products/recaptcha
             */
            NEXT_PUBLIC_CAPTCHA_SITE_KEY: z.string().optional(),
        },
        server: {
            /**
             * @example v1,whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw
             */
            AUTH_WEBHOOK_SECRET: z.string().min(1),
            EMAIL_FROM: z.string().min(1),
            /**
             * For AI models
             */
            GROQ_API_KEY: z.string().optional(),
        },
        runtimeEnv: {
            NEXT_PUBLIC_CAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY,
            AUTH_WEBHOOK_SECRET: process.env.AUTH_WEBHOOK_SECRET,
            EMAIL_FROM: process.env.EMAIL_FROM,
            GROQ_API_KEY: process.env.GROQ_API_KEY,
        },
        emptyStringAsUndefined: true,
    });
