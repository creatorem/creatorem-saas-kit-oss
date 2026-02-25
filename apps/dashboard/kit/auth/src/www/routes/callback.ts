import { AuthCallbackEngine, getSupabaseServerClient } from '@kit/supabase-server';
import type { i18n } from 'i18next';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { AuthConfig } from '../../config';

export const createCallbackRoute =
    (authConfig: AuthConfig, getServerI18n: () => Promise<i18n>) => async (request: NextRequest) => {
        const engine = new AuthCallbackEngine(getSupabaseServerClient());
        const { language } = await getServerI18n();

        const { nextPath } = await engine.exchangeCodeForSession(request, {
            redirectPath: authConfig.urls.dashboard.replace('[lang]', language),
        });

        return redirect(nextPath);
    };
