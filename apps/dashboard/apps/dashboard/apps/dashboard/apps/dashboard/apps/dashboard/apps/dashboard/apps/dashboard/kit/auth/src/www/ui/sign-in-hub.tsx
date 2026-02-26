'use client';

import { applyFilter, useApplyFilter } from '@kit/utils/filters';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { AuthConfig } from '../../config';
import { OauthForm } from './components/oauth-form';
import { PasswordSignInForm } from './components/sign-in/password-sign-in-form';

interface SignInHubProps {
    authConfig: AuthConfig;
}

export const SignInHub: React.FC<SignInHubProps> = ({ authConfig }) => {
    const router = useRouter();
    const url = useApplyFilter('get_url_updater', (u) => u);
    const nextPath = useSearchParams().get('next') ?? url(authConfig.urls.dashboard);
    const { t } = useTranslation('p_auth');

    const onSignIn = useCallback(() => {
        const redirectPath = applyFilter('auth_on_sign_in_redirect_url', nextPath);
        router.replace(redirectPath);
    }, [nextPath, router]);

    return (
        <div className="flex flex-col gap-4">
            {authConfig.providers.password && (
                <PasswordSignInForm
                    authConfig={authConfig}
                    onSignIn={onSignIn}
                    forgottenPasswordLink={url(authConfig.urls.forgottenPassword)}
                />
            )}

            {authConfig.providers.oAuth.length > 0 && (
                <>
                    {authConfig.providers.password ? (
                        <div className="flex items-center gap-2">
                            <div className="border-b flex-1"></div>
                            <span className="text-muted-foreground px-2 text-sm whitespace-nowrap">
                                {t('orContinueWith')}
                            </span>
                            <div className="border-b flex-1"></div>
                        </div>
                    ) : null}

                    <OauthForm createUser={false} authConfig={authConfig} />
                </>
            )}
        </div>
    );
};
