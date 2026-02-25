'use client';

/**
 * todo: can be factoried even more
 */

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { ConfirmButton } from '@kit/ui/confirm-button';
import { Icon } from '@kit/ui/icon';
import { Input } from '@kit/ui/input';
import { toast } from '@kit/ui/sonner';
import { Muted } from '@kit/ui/text';
import { getInitials } from '@kit/utils';
import { formatTimeDifference } from '@kit/utils/www';
import { useCallback, useMemo, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { UserInvitationWithOrganization } from '../../../shared/invitation/hooks/use-invitation-responder';
import { useInvitationSearch } from '../../../shared/invitation/hooks/use-invitation-search';

export interface UserInvitationsViewProps {
    invitations: UserInvitationWithOrganization[];
    onAcceptInvitation?: (invitationId: string) => Promise<void>;
    onDeclineInvitation?: (invitationId: string) => Promise<void>;
    className?: string;
    processingInvitations?: Set<string>;
}

// Helper function to get role display configuration for dynamic roles
function getRoleConfig(
    roleName: string | undefined | null,
    hierarchyLevel: number | null | undefined,
    t: (key: string) => string,
) {
    if (!roleName) {
        return { label: t('invitations.form.role.unknown'), color: 'outline' as const };
    }

    // Determine color based on hierarchy level, with fallback for unknown levels
    let color: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';

    if (typeof hierarchyLevel === 'number') {
        if (hierarchyLevel >= 2) {
            color = 'default'; // High privilege roles (editor level)
        } else if (hierarchyLevel >= 1) {
            color = 'secondary'; // Basic roles (contributor level)
        }
    }

    // Capitalize the role name for display
    const label = roleName.charAt(0).toUpperCase() + roleName.slice(1);

    return { label, color };
}

// Helper function to check if invitation is expired
function isInvitationExpired(invitation: UserInvitationWithOrganization): boolean {
    if (!invitation.expiresAt) return false;
    return new Date(invitation.expiresAt) < new Date();
}

export function UserInvitationsView({
    invitations,
    onAcceptInvitation,
    onDeclineInvitation,
    processingInvitations = new Set(),
}: UserInvitationsViewProps) {
    const { t } = useTranslation('p_org-settings');
    const { searchQuery, setSearchQuery, filteredInvitations } = useInvitationSearch({ invitations });
    const [isPending, startTransition] = useTransition();

    // Group invitations by status
    const { pendingInvitations, expiredInvitations } = useMemo(() => {
        const pending: UserInvitationWithOrganization[] = [];
        const expired: UserInvitationWithOrganization[] = [];

        filteredInvitations.forEach((invitation) => {
            if (isInvitationExpired(invitation)) {
                expired.push(invitation);
            } else {
                pending.push(invitation);
            }
        });

        return { pendingInvitations: pending, expiredInvitations: expired };
    }, [filteredInvitations]);

    // Handle invitation acceptance
    const handleAcceptInvitation = useCallback(
        async (invitationId: string) => {
            if (!onAcceptInvitation) return;

            startTransition(async () => {
                try {
                    await onAcceptInvitation(invitationId);
                    toast.success(t('invitations.toast.invitationAcceptedSuccess'));
                } catch (error) {
                    toast.error(t('invitations.toast.invitationAcceptedError'));
                    console.error('Failed to accept invitation:', error);
                }
            });
        },
        [onAcceptInvitation, t],
    );

    // Handle invitation decline
    const handleDeclineInvitation = useCallback(
        async (invitationId: string) => {
            if (!onDeclineInvitation) return;

            startTransition(async () => {
                try {
                    await onDeclineInvitation(invitationId);
                    toast.success(t('invitations.toast.invitationDeclinedSuccess'));
                } catch (error) {
                    toast.error(t('invitations.toast.invitationDeclinedError'));
                    console.error('Failed to decline invitation:', error);
                }
            });
        },
        [onDeclineInvitation, t],
    );

    const renderInvitationItem = useCallback(
        (invitation: UserInvitationWithOrganization, isExpired: boolean = false) => {
            const roleInfo = getRoleConfig(
                invitation.organizationRole.name,
                invitation.organizationRole.hierarchyLevel,
                t as unknown as (key: string) => string,
            );

            return (
                <div
                    key={invitation.id}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                        isExpired ? 'bg-muted/30 opacity-60' : ''
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <Avatar className="bg-background outline-border size-12 rounded-full outline outline-offset-2">
                            <AvatarImage
                                src={invitation.organization.logoUrl ?? undefined}
                                alt={invitation.organization.name}
                            />
                            <AvatarFallback className="rounded-full text-lg group-hover/navuser:bg-neutral-200 dark:group-hover/navuser:bg-neutral-700">
                                {getInitials(invitation.organization.name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold">{invitation.organization.name}</span>
                                {isExpired && (
                                    <Badge variant="destructive" className="text-xs">
                                        {t('invitations.userView.status.expired')}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span>{t('invitations.userView.invitedAs')}</span>
                                <Badge variant={roleInfo.color} className="text-xs">
                                    {roleInfo.label}
                                </Badge>
                            </div>
                            <Muted className="text-sm">
                                {t('invitations.userView.invited', {
                                    time: formatTimeDifference(invitation.createdAt),
                                })}
                            </Muted>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isExpired && onAcceptInvitation && (
                            <ConfirmButton
                                onConfirmation={() => handleAcceptInvitation(invitation.id)}
                                disabled={isPending || processingInvitations.has(invitation.id)}
                                loading={processingInvitations.has(invitation.id)}
                                className="gap-2"
                                header={t('invitations.userView.accept.header', {
                                    organizationName: invitation.organization.name,
                                })}
                                content={t('invitations.userView.accept.content', {
                                    organizationName: invitation.organization.name,
                                    roleName: roleInfo.label,
                                })}
                                aria-label={t('invitations.userView.accept.ariaLabel', {
                                    organizationName: invitation.organization.name,
                                })}
                                size="sm"
                            >
                                {processingInvitations.has(invitation.id) ? (
                                    t('invitations.button.accepting')
                                ) : (
                                    <>
                                        <Icon name="Check" className="h-4 w-4" />
                                        {t('invitations.button.accept')}
                                    </>
                                )}
                            </ConfirmButton>
                        )}

                        {onDeclineInvitation && (
                            <ConfirmButton
                                aria-label={
                                    isExpired
                                        ? t('invitations.userView.decline.removeAriaLabel')
                                        : t('invitations.userView.decline.ariaLabel')
                                }
                                variant="outline"
                                onConfirmation={() => handleDeclineInvitation(invitation.id)}
                                header={
                                    isExpired
                                        ? t('invitations.userView.decline.removeHeader')
                                        : t('invitations.userView.decline.header')
                                }
                                content={
                                    <>
                                        {t('invitations.userView.decline.content', {
                                            action: isExpired
                                                ? t('invitations.button.remove').toLowerCase()
                                                : t('invitations.button.decline').toLowerCase(),
                                            organizationName: invitation.organization.name,
                                        })}
                                        {!isExpired && t('invitations.userView.decline.contentWarning')}
                                    </>
                                }
                                buttonLabels={{
                                    confirm: isExpired
                                        ? t('invitations.button.remove')
                                        : t('invitations.button.decline'),
                                }}
                                confirmButtonProps={{
                                    size: 'icon',
                                    variant: 'destructive',
                                }}
                                size="icon-sm"
                            >
                                <Icon name="X" className="h-4 w-4" />
                            </ConfirmButton>
                        )}
                    </div>
                </div>
            );
        },
        [handleAcceptInvitation, handleDeclineInvitation, isPending, processingInvitations, t],
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Icon name="SendHorizontal" className="h-5 w-5" />
                        {t('invitations.userView.title', { count: filteredInvitations.length })}
                    </CardTitle>
                </div>

                {/* Search */}
                <div className="relative">
                    <Icon
                        name="Search"
                        className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                    />
                    <Input
                        placeholder={t('invitations.userView.search.placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </CardHeader>

            <CardContent>
                {filteredInvitations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Icon name="SendHorizontal" className="text-muted-foreground mb-4 h-12 w-12" />
                        <h3 className="mb-2 text-lg font-semibold">
                            {searchQuery
                                ? t('invitations.userView.empty.noMatching')
                                : t('invitations.userView.empty.noInvitations')}
                        </h3>
                        <Muted>
                            {searchQuery
                                ? t('invitations.userView.empty.tryAdjusting')
                                : t('invitations.userView.empty.noDescription')}
                        </Muted>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Pending Invitations */}
                        {pendingInvitations.length > 0 && (
                            <div className="space-y-3">
                                {pendingInvitations.length > 0 && expiredInvitations.length > 0 && (
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <Icon name="CalendarCheck" className="text-primary h-4 w-4" />
                                        <span className="text-primary text-sm font-medium">
                                            {t('invitations.userView.sections.pending', {
                                                count: pendingInvitations.length,
                                            })}
                                        </span>
                                    </div>
                                )}
                                {pendingInvitations.map((invitation) => renderInvitationItem(invitation, false))}
                            </div>
                        )}

                        {/* Expired Invitations */}
                        {expiredInvitations.length > 0 && (
                            <div className="space-y-3">
                                {pendingInvitations.length > 0 && (
                                    <div className="flex items-center gap-2 border-b pt-4 pb-2">
                                        <Icon name="AlertCircle" className="text-destructive h-4 w-4" />
                                        <span className="text-destructive text-sm font-medium">
                                            {t('invitations.userView.sections.expired', {
                                                count: expiredInvitations.length,
                                            })}
                                        </span>
                                    </div>
                                )}
                                {expiredInvitations.map((invitation) => renderInvitationItem(invitation, true))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
