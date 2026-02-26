'use client';

import { useUser } from '@kit/auth/shared/user';
import { getMfaMutationKey, useAuthFactorsList, useSupabase } from '@kit/supabase';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardFooter } from '@kit/ui/card';
import { Icon } from '@kit/ui/icon';
import { Separator } from '@kit/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kit/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@kit/ui/tooltip';
import { cn } from '@kit/utils';
import type { Factor } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { MultiFactorAuthSetupDialog } from './multi-factor-auth-setup-dialog';
import { MultiFactorAuthSkeleton } from './multi-factor-auth-skeleton';

export function MultiFactorAuthList({ className }: { className?: string }) {
    const { t } = useTranslation('p_auth');
    const user = useUser();
    const { data: factors, isLoading, isError } = useAuthFactorsList(user.id);

    if (isLoading) {
        return <MultiFactorAuthSkeleton />;
    }

    if (isError) {
        return (
            <Card className={cn('border-destructive', className)}>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Icon name="TriangleAlert" className="text-destructive h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                        <h3 className="text-destructive text-lg font-semibold">{t('mfaErrorLoadingFactorsTitle')}</h3>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">{t('mfaErrorLoadingFactorsDescription')}</p>
                </CardContent>
                <Separator />
                <CardFooter className="flex w-full justify-end">
                    <MultiFactorAuthSetupDialog userId={user.id} />
                </CardFooter>
            </Card>
        );
    }

    const allFactors = factors?.all ?? [];

    if (!allFactors.length) {
        return (
            <Card className={cn(className)}>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Icon name="Shield" className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                        <h3 className="text-lg font-semibold">{t('mfaSecureAccountTitle')}</h3>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">{t('mfaSecureAccountDescription')}</p>
                </CardContent>
                <Separator />
                <CardFooter className="flex w-full justify-end">
                    <MultiFactorAuthSetupDialog userId={user.id} />
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className={cn(className, 'pt-0')}>
            <CardContent className="px-2">
                <FactorsTable factors={allFactors} userId={user.id} />
            </CardContent>
            <Separator />
            <CardFooter className="flex w-full justify-end">
                <MultiFactorAuthSetupDialog userId={user.id} />
            </CardFooter>
        </Card>
    );
}

function ConfirmUnenrollFactorModal(
    props: React.PropsWithChildren<{
        factorId: string;
        userId: string;
        setIsModalOpen: (isOpen: boolean) => void;
    }>,
) {
    const { t } = useTranslation('p_auth');
    const unEnroll = useUnenrollFactor(props.userId);

    const onUnenrollRequested = useCallback(
        (factorId: string) => {
            if (unEnroll.isPending) return;

            const promise = unEnroll.mutateAsync(factorId).then((response) => {
                props.setIsModalOpen(false);

                if (!response.success) {
                    const errorCode = response.data;

                    throw t(`errors.supabase.${errorCode}`, {
                        defaultValue: t('unenrollFactorError'),
                    });
                }
            });

            toast.promise(promise, {
                loading: t('unenrollingFactor'),
                success: t('unenrollFactorSuccess'),
                error: (error: string) => {
                    return error;
                },
            });
        },
        [props, t, unEnroll],
    );

    return (
        <AlertDialog open={!!props.factorId} onOpenChange={props.setIsModalOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('unenrollFactor')}</AlertDialogTitle>

                    <AlertDialogDescription>{t('unenrollFactorDescription')}</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>

                    <AlertDialogAction
                        type={'button'}
                        disabled={unEnroll.isPending}
                        onClick={() => onUnenrollRequested(props.factorId)}
                    >
                        {t('yesUnenrollFactor')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function FactorsTable({
    factors,
    userId,
}: React.PropsWithChildren<{
    factors: Factor[];
    userId: string;
}>) {
    const { t } = useTranslation('p_auth');
    const [unEnrolling, setUnenrolling] = useState<string>();

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('factorName')}</TableHead>
                        <TableHead>{t('type')}</TableHead>
                        <TableHead>{t('status')}</TableHead>

                        <TableHead />
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {factors.map((factor) => (
                        <TableRow key={factor.id}>
                            <TableCell>
                                <span className={'block truncate'}>{factor.friendly_name}</span>
                            </TableCell>

                            <TableCell>
                                <Badge variant={'info'} className={'inline-flex uppercase'}>
                                    {factor.factor_type}
                                </Badge>
                            </TableCell>

                            <td>
                                <Badge
                                    className={'inline-flex capitalize'}
                                    variant={factor.status === 'verified' ? 'success' : 'outline'}
                                >
                                    {factor.status}
                                </Badge>
                            </td>

                            <td className={'flex justify-end'}>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant={'ghost'}
                                                size={'icon'}
                                                aria-label={t('removeFactor')}
                                                onClick={() => setUnenrolling(factor.id)}
                                            >
                                                <Icon name="X" className={'h-4'} />
                                            </Button>
                                        </TooltipTrigger>

                                        <TooltipContent>{t('unenrollThisFactor')}</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </td>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {unEnrolling && (
                <ConfirmUnenrollFactorModal
                    userId={userId}
                    factorId={unEnrolling}
                    setIsModalOpen={() => setUnenrolling(undefined)}
                />
            )}
        </>
    );
}

function useUnenrollFactor(userId: string) {
    const queryClient = useQueryClient();
    const client = useSupabase();
    const mutationKey = getMfaMutationKey(userId);

    const mutationFn = async (factorId: string) => {
        const { data, error } = await client.auth.mfa.unenroll({
            factorId,
        });

        if (error) {
            return {
                success: false as const,
                data: error.code as string,
            };
        }

        return {
            success: true as const,
            data,
        };
    };

    return useMutation({
        mutationFn,
        mutationKey,
        onSuccess: () => {
            return queryClient.refetchQueries({
                queryKey: mutationKey,
            });
        },
    });
}
