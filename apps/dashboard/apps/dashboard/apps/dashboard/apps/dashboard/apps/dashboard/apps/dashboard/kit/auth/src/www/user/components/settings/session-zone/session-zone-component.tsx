'use client';

import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { ConfirmButton } from '@kit/ui/confirm-button';
import { DialogTitle } from '@kit/ui/dialog';
import { Icon } from '@kit/ui/icon';
import { Separator } from '@kit/ui/separator';
import { toast } from '@kit/ui/sonner';
import { Spinner } from '@kit/ui/spinner';
import { cn } from '@kit/utils';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { authRouter } from '../../../../../router/router';
import { getDeviceLabel, parseUserAgent, useAuthSessions } from '../../../../../shared/hooks/use-auth-sessions';
import { SessionZoneSkeleton } from './session-zone-skeleton';

interface SessionZoneComponentProps {
    className?: string;
    redirectTo: string;
    clientTrpc: TrpcClientWithQuery<typeof authRouter>;
}

export function SessionZoneComponent({ className, redirectTo, clientTrpc }: SessionZoneComponentProps) {
    const router = useRouter();
    const { t } = useTranslation('p_auth');

    const {
        sessions,
        loading,
        revoking,
        revokingAll,
        activeSessionId,
        revokeAllOtherSessions,
        formatLocationDisplay,
        revokeCurrentSession,
        revokeSession,
    } = useAuthSessions({
        toast,
        onCurrentSessionRevoked: () => {
            router.push(redirectTo);
        },
        clientTrpc,
    });

    const getDeviceIcon = (device: string) => {
        switch (device) {
            case 'Mobile':
                return <Icon name="Smartphone" className="h-4 w-4" />;
            case 'Tablet':
                return <Icon name="Tablet" className="h-4 w-4" />;
            default:
                return <Icon name="Monitor" className="h-4 w-4" />;
        }
    };

    if (loading) {
        return <SessionZoneSkeleton />;
    }

    return (
        <Card className={cn('w-full', className)}>
            <CardHeader>
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Icon name="Shield" className="h-5 w-5" />
                            {t('activeSessionsTitle')}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {t('activeSessionsDescription', {
                                count: sessions.length,
                                plural: sessions.length !== 1 ? 's' : '',
                            })}
                        </CardDescription>
                    </div>
                    {sessions.length > 1 && (
                        <ConfirmButton
                            variant="destructive"
                            size="sm"
                            onConfirmation={revokeAllOtherSessions}
                            aria-label={t('revokeAllOthers')}
                            content={
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Icon name="AlertCircle" className="text-destructive h-5 w-5" />
                                        <DialogTitle>{t('revokeAllOthers')}</DialogTitle>
                                    </div>
                                    <p className="text-muted-foreground text-sm">{t('revokeAllOthersDescription')}</p>
                                </div>
                            }
                            disabled={revokingAll}
                            buttonLabels={{
                                confirm: t('revoke'),
                            }}
                            className="w-full sm:w-auto"
                        >
                            {revokingAll ? (
                                <Spinner className="h-4 w-4" />
                            ) : (
                                <>
                                    <Icon name="LogOut" className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">{t('revokeAllOthers')}</span>
                                    <span className="sm:hidden">{t('revokeAllOthers')}</span>
                                </>
                            )}
                        </ConfirmButton>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {sessions.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center">{t('noActiveSessions')}</div>
                ) : (
                    sessions.map((session, index) => {
                        const isCurrentSession = session.id === activeSessionId;
                        const { device } = parseUserAgent(session.user_agent);
                        const deviceLabel = getDeviceLabel(session.user_agent);
                        const lastActive = formatDistanceToNow(new Date(session.updated_at), {
                            addSuffix: true,
                        });
                        const locationDisplay = formatLocationDisplay(session.ip);

                        return (
                            <div key={session.id}>
                                <div className="flex flex-col space-y-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                    <div className="flex min-w-0 flex-1 items-start gap-3">
                                        <div className="mt-1 flex-shrink-0">{getDeviceIcon(device)}</div>
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-medium sm:text-base">{deviceLabel}</span>
                                                {isCurrentSession && (
                                                    <Badge variant="default" className="text-xs">
                                                        {t('currentSession')}
                                                    </Badge>
                                                )}
                                                {session.aal === 'aal2' && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {t('mfaBadge')}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-muted-foreground space-y-1 text-xs sm:text-sm">
                                                <div>
                                                    {t('lastActive')} {lastActive}
                                                </div>
                                                <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0">
                                                    <span className="flex items-center gap-1">
                                                        <Icon name="MapPin" className="h-3 w-3 flex-shrink-0" />
                                                        {locationDisplay.isLoading ? (
                                                            <span className="flex items-center gap-1">
                                                                <Spinner className="h-3 w-3" />
                                                                {t('loading')}
                                                            </span>
                                                        ) : (
                                                            <span className="truncate">{locationDisplay.text}</span>
                                                        )}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Icon name="Calendar" className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {t('created')}{' '}
                                                            {formatDistanceToNow(new Date(session.created_at), {
                                                                addSuffix: true,
                                                            })}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full flex-shrink-0 sm:w-auto">
                                        {isCurrentSession ? (
                                            <ConfirmButton
                                                variant="outline_destructive"
                                                size="sm"
                                                onConfirmation={() => revokeCurrentSession(session.id)}
                                                aria-label={t('signOut')}
                                                header={{
                                                    title: t('signOut'),
                                                    description: t('revokeSessionDescription'),
                                                }}
                                                disabled={revoking === session.id}
                                                buttonLabels={{
                                                    confirm: t('revoke'),
                                                }}
                                                className="w-full sm:w-auto"
                                            >
                                                {revoking === session.id ? (
                                                    <Spinner className="h-4 w-4" />
                                                ) : (
                                                    <>
                                                        <Icon name="LogOut" className="mr-2 h-4 w-4" />
                                                        <span className="sm:hidden">{t('signOut')}</span>
                                                        <span className="hidden sm:inline">{t('signOut')}</span>
                                                    </>
                                                )}
                                            </ConfirmButton>
                                        ) : (
                                            <ConfirmButton
                                                variant="destructive"
                                                size="sm"
                                                onConfirmation={() => revokeSession(session.id)}
                                                aria-label={t('revoke')}
                                                header={{
                                                    title: t('revoke'),
                                                    description: t('revokeSessionDescription'),
                                                }}
                                                disabled={revoking === session.id}
                                                buttonLabels={{
                                                    confirm: t('revoke'),
                                                }}
                                                className="w-full sm:w-auto"
                                            >
                                                {revoking === session.id ? (
                                                    <Spinner className="h-4 w-4" />
                                                ) : (
                                                    <>
                                                        <Icon name="X" className="mr-2 h-4 w-4" />
                                                        <span className="sm:hidden">{t('revoke')}</span>
                                                        <span className="hidden sm:inline">{t('revokeSession')}</span>
                                                    </>
                                                )}
                                            </ConfirmButton>
                                        )}
                                    </div>
                                </div>
                                {index < sessions.length - 1 && <Separator className="my-2" />}
                            </div>
                        );
                    })
                )}

                <div className="text-muted-foreground pt-4 text-xs sm:text-sm">
                    <p className="flex items-start gap-2">
                        <Icon name="BadgeInfo" className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{t('locationInfo')}</span>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
