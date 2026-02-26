'use client';

import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Card, CardContent, CardFooter } from '@kit/ui/card';
import { Separator } from '@kit/ui/separator';
import { cn } from '@kit/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { authRouter } from '../../../../../router/router';
import { DeleteUserButton } from './delete-user-button';

interface DangerZoneComponentProps {
    className?: string;
    clientTrpc: TrpcClientWithQuery<typeof authRouter>;
}

export function DangerZoneComponent({ className, clientTrpc }: DangerZoneComponentProps): React.JSX.Element {
    const { t } = useTranslation('p_auth');
    return (
        <Card className={cn('border-destructive', className)}>
            <CardContent>
                <h3 className="text-destructive text-lg font-semibold">{t('dangerZoneTitle')}</h3>
                <p className="text-muted-foreground mt-2 text-sm font-normal">{t('dangerZoneDescription')}</p>
            </CardContent>
            <Separator />
            <CardFooter className="flex w-full justify-end pt-6">
                <DeleteUserButton clientTrpc={clientTrpc} />
            </CardFooter>
        </Card>
    );
}
