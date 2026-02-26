'use client';

import { AuthConfig } from '@kit/auth/config';
import { useUser } from '@kit/supabase';
import { Alert } from '@kit/ui/alert';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Icon } from '@kit/ui/icon';
import { Separator } from '@kit/ui/separator';
import { cn } from '@kit/utils';
import type { Provider } from '@supabase/supabase-js';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getProviderName } from '../../../../../shared/get-provider-name';
import { OauthProviderIcon } from '../../../../ui/components/oauth-provider-icon';
import { UpdatePasswordForm } from '../../../../ui/update-password-form';
import { AuthProviderSkeleton } from './auth-provider-skeleton';

function UpdatePasswordCard({
    authConfig,
    user,
}: {
    authConfig: AuthConfig;
    user: NonNullable<ReturnType<typeof useUser>['data']>;
}) {
    const { t } = useTranslation('p_auth');
    return (
        <Card className={cn('mx-auto w-full max-w-4xl')}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon name="Lock" className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span>{t('updatePasswordCardTitle')}</span>
                </CardTitle>
                <CardDescription>{t('updatePasswordCardDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <UpdatePasswordForm authConfig={authConfig} />
            </CardContent>
        </Card>
    );
}

function LoginProvidersList({
    identities,
    user,
}: {
    identities: NonNullable<NonNullable<ReturnType<typeof useUser>['data']>['supabase']['identities']>;
    user: NonNullable<ReturnType<typeof useUser>['data']>;
}) {
    const { t } = useTranslation('p_auth');
    const uniqueProviders = Array.from(new Set(identities.map((identity) => identity.provider))).map((provider) => {
        const identity = identities.find((id) => id.provider === provider);
        return {
            provider: provider as Provider,
            identity,
        };
    });

    return (
        <Card className={cn('mx-auto w-full max-w-4xl')}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon name="Lock" className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span>{t('loginProvidersTitle')}</span>
                </CardTitle>
                <CardDescription>{t('loginProvidersDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {uniqueProviders.map(({ provider, identity }, index) => {
                        return (
                            <React.Fragment key={provider}>
                                <div className="flex flex-col gap-3 rounded-lg px-2 py-3 transition-colors sm:flex-row sm:items-center sm:gap-4 sm:px-0">
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        <div className={'flex-shrink-0 rounded-full border-2 p-2.5 sm:p-2'}>
                                            <OauthProviderIcon provider={provider} className="size-6" />
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-col">
                                            <span className="truncate text-sm font-medium sm:text-base">
                                                {getProviderName(provider)}
                                            </span>
                                            {user.supabase?.email && (
                                                <span className="text-muted-foreground truncate text-xs sm:text-sm">
                                                    {user.supabase.email}
                                                </span>
                                            )}
                                            {identity?.last_sign_in_at && (
                                                <span className="text-muted-foreground mt-0.5 text-xs">
                                                    {t('lastUsed')}:{' '}
                                                    {new Date(identity.last_sign_in_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ml-auto flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <Badge variant="secondary" className="w-fit px-2 py-1 text-xs">
                                            {t('connected')}
                                        </Badge>
                                        {identity?.created_at && (
                                            <span className="text-muted-foreground text-xs whitespace-nowrap">
                                                {t('since')} {new Date(identity.created_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {index < uniqueProviders.length - 1 && <Separator className="my-1" />}
                            </React.Fragment>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

interface AuthProviderZoneProps {
    authConfig: AuthConfig;
}

export function AuthProviderZone({ authConfig }: AuthProviderZoneProps) {
    const { t } = useTranslation('p_auth');
    const { data: user, isPending } = useUser();

    if (isPending) {
        return <AuthProviderSkeleton />;
    }

    if (!user) {
        return (
            <Alert variant="warning" className={'mx-auto w-full max-w-4xl'}>
                <div className="text-sm">{t('userNotFound')}</div>
            </Alert>
        );
    }

    const identities = user.supabase?.identities || [];

    if (identities.length === 0) {
        return (
            <Alert variant="warning" className={'mx-auto w-full max-w-4xl'}>
                <div className="text-sm">{t('noAuthMethods')}</div>
            </Alert>
        );
    }

    const canUpdatePassword = identities.some((item) => item.provider === 'email');
    if (canUpdatePassword) {
        return <UpdatePasswordCard authConfig={authConfig} user={user} />;
    }

    return <LoginProvidersList identities={identities} user={user} />;
}
