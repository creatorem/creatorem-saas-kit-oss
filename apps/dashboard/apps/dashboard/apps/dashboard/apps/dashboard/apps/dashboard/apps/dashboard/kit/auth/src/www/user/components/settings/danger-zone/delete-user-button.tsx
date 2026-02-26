'use client';

import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Alert, AlertDescription } from '@kit/ui/alert';
import { ConfirmButton } from '@kit/ui/confirm-button';
import { toast } from '@kit/ui/sonner';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authRouter } from '../../../../../router/router';
import { AuthConfig } from '../../../../../config';

export function DeleteUserButton({
    clientTrpc,
    authConfig
}: {
    clientTrpc: TrpcClientWithQuery<typeof authRouter>;
    authConfig?: AuthConfig
}): React.JSX.Element {
    const { t } = useTranslation('p_auth');
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDeleteUser = async (e: React.MouseEvent) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await clientTrpc.deleteUser.fetch();
            toast.success(t('deleteAccountSuccess'));
            if (!authConfig) return;

            if (authConfig.environment !== 'www') {
                throw new Error('www env required in this file.');
            }
            router.push(authConfig.urls.signIn);
        } catch (error) {
            toast.error(t('deleteAccountError'));
            setIsSubmitting(false);
        }
    };

    return (
        <ConfirmButton
            type="button"
            aria-label={t('deleteAccount')}
            variant="destructive"
            disabled={isSubmitting}
            onConfirmation={handleDeleteUser}
            header={{
                title: t('deleteAccountConfirmTitle'),
                description: t('deleteAccountConfirmDescription'),
            }}
            content={
                <div className="pt-4">
                    <Alert variant="destructive">
                        <AlertDescription>{t('deleteAccountWarning')}</AlertDescription>
                    </Alert>
                </div>
            }
            operation={{
                type: 'write',
                value: t('deleteAccount'),
            }}
            buttonLabels={{
                cancel: t('cancel'),
                confirm: t('deleteAccount'),
            }}
        >
            {t('deleteAccount')}
        </ConfirmButton>
    );
}
