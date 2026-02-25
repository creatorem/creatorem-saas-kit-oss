'use client';

import { useProviderSignInAndUp } from '@kit/supabase';
import { Button } from '@kit/ui/button';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { cn } from '@kit/utils';
import { useApplyFilter } from '@kit/utils/filters';
import type { AuthError, Provider, SignInWithOAuthCredentials } from '@supabase/supabase-js';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthConfig } from '../../../config';
import { getProviderName } from '../../../shared/get-provider-name';
import { AuthErrorAlert } from './auth-error-alert';
import { OauthProviderIcon } from './oauth-provider-icon';

export function OauthForm({
    authConfig,
}: {
    createUser: boolean; // unused
    authConfig: AuthConfig;
}) {
    const signInWithProviderMutation = useProviderSignInAndUp();
    const url = useApplyFilter('get_url_updater', (u) => u);

    const createClickHandler = useCallback(
        (provider: Provider) => async () => {
            const paths = {
                callback: url(authConfig.urls.callback),
                returnPath: url(authConfig.urls.dashboard),
            };

            const origin = window.location.origin;
            const queryParams = new URLSearchParams(window.location.search);

            if (paths.returnPath) {
                queryParams.set('next', paths.returnPath);
            }

            const redirectPath = [paths.callback, queryParams.toString()].filter(Boolean).join('?');

            const credentials: SignInWithOAuthCredentials = {
                provider,
                options: {
                    redirectTo: [origin, redirectPath].join(''),
                },
            };

            const res = await signInWithProviderMutation.mutateAsync(credentials);

            if (!res) {
                throw new Error('Failed to sign in with provider');
            }
        },
        [signInWithProviderMutation, authConfig.urls.callback, authConfig.urls.dashboard],
    );

    if (!authConfig.providers.oAuth.length) {
        return null;
    }

    return (
        <>
            {signInWithProviderMutation.isPending && <LoadingOverlay />}

            <div className={'flex w-full flex-1 flex-col space-y-3'}>
                <div
                    className={cn(
                        'gap-2',
                        authConfig.providers.oAuth.length > 1 ? 'grid grid-cols-1 md:grid-cols-2' : 'flex-col',
                    )}
                >
                    {authConfig.providers.oAuth.map((provider) => {
                        return (
                            <AuthProviderButton
                                key={provider}
                                providerId={provider}
                                onClick={createClickHandler(provider)}
                                loading={signInWithProviderMutation.isPending}
                            >
                                {getProviderName(provider)}
                            </AuthProviderButton>
                        );
                    })}
                </div>

                <AuthErrorAlert error={signInWithProviderMutation.error as AuthError | null} />
            </div>
        </>
    );
}

function AuthProviderButton({
    providerId,
    onClick,
    children,
    loading,
}: React.PropsWithChildren<{
    providerId: Provider;
    onClick: () => void;
    loading: boolean;
}>) {
    const { t } = useTranslation('p_auth');
    return (
        <Button
            aria-label={t('signInWithProvider', { provider: getProviderName(providerId) })}
            className={'flex w-full items-center justify-center gap-x-2'}
            variant={'outline'}
            onClick={onClick}
            loading={loading}
        >
            <OauthProviderIcon provider={providerId} />

            <span>{children}</span>
        </Button>
    );
}
