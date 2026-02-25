'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { cn } from '@kit/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';

export function InvitationRevokedCard({ className, ...other }: React.ComponentProps<typeof Card>): React.JSX.Element {
    const { t } = useTranslation('p_org-settings');

    return (
        <Card className={cn('dark:border-border px-4 py-2', className)} {...other}>
            <CardHeader>
                <CardTitle className="text-base lg:text-lg">{t('invitations.revoked.title')}</CardTitle>
                <CardDescription>{t('invitations.revoked.description')}</CardDescription>
            </CardHeader>
        </Card>
    );
}
