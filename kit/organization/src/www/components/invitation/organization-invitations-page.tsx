'use client';

import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Alert, AlertTitle } from '@kit/ui/alert';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { ConfirmButton } from '@kit/ui/confirm-button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Icon } from '@kit/ui/icon';
import { SearchInput } from '@kit/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kit/ui/select';
import { Skeleton } from '@kit/ui/skeleton';
import { toast } from '@kit/ui/sonner';
import { Muted } from '@kit/ui/text';
import { formatTimeDifference } from '@kit/utils/www';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { organizationRouter } from '../../../router/router';
import { useOrganizationInvitationControllers } from '../../../shared/hooks/use-organization-invitation-controllers';
import {
    OrganizationInvitationWithRole,
    useOrganizationInvitationFilter,
} from '../../../shared/hooks/use-organization-invitation-filter';
import { InvitationButton } from './invitation-button';

interface OrganizationInvitationsManagerProps {
    invitations: OrganizationInvitationWithRole[];
    onDeleteInvitation?: (invitationId: string) => Promise<void>;
    onResendInvitation?: (invitationId: string) => Promise<void>;
    onInvitationsUpdated: () => void;
    canInviteMembers: boolean;
    currentMember: { roleHierarchyLevel: number };
    onSendInvitation?: (data: any) => Promise<string>;
}

function getRoleConfig(
    roleName: string | undefined | null,
    hierarchyLevel: number | null | undefined,
    t: (key: string) => string,
) {
    if (!roleName) {
        return { label: t('invitations.form.role.unknown'), color: 'outline' as const };
    }

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

function OrganizationInvitationsManager({
    invitations,
    onDeleteInvitation,
    onResendInvitation,
    onInvitationsUpdated,
    canInviteMembers = false,
    currentMember,
    onSendInvitation,
}: OrganizationInvitationsManagerProps) {
    const { t } = useTranslation('p_org-settings');
    const {
        filteredInvitations,
        searchQuery,
        handleSearchQuery,
        selectedRole,
        availableRoles,
        setSelectedRole,
        pendingInvitations,
        expiredInvitations,
    } = useOrganizationInvitationFilter({ invitations });

    const handleDeleteInvitation = useCallback(
        async (invitationId: string) => {
            if (!onDeleteInvitation) return;

            try {
                await onDeleteInvitation(invitationId);
                toast.success(t('invitations.toast.invitationDeletedSuccess'));
                onInvitationsUpdated?.();
            } catch (error) {
                toast.error(t('invitations.toast.invitationDeletedError'));
                console.error('Failed to delete invitation:', error);
            }
        },
        [onDeleteInvitation, onInvitationsUpdated, t],
    );

    const handleResendInvitation = useCallback(
        async (invitationId: string) => {
            if (!onResendInvitation) return;

            try {
                await onResendInvitation(invitationId);
                toast.success(t('invitations.toast.invitationResentSuccess'));
                onInvitationsUpdated?.();
            } catch (error) {
                toast.error(t('invitations.toast.invitationResentError'));
                console.error('Failed to resend invitation:', error);
            }
        },
        [onResendInvitation, onInvitationsUpdated, t],
    );

    const renderInvitationItem = useCallback(
        (invitation: OrganizationInvitationWithRole, isExpired: boolean = false) => {
            const roleInfo = getRoleConfig(
                invitation.roleName,
                invitation.roleHierarchyLevel,
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
                        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                            <Icon name="Mail" className="text-muted-foreground h-4 w-4" />
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{invitation.email}</span>
                                {isExpired && (
                                    <Badge variant="destructive" className="text-xs">
                                        {t('invitations.organizationView.status.expired')}
                                    </Badge>
                                )}
                            </div>
                            <Muted className="text-sm">
                                {t('invitations.organizationView.invited', {
                                    time: formatTimeDifference(invitation.createdAt),
                                })}
                            </Muted>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant={roleInfo.color}>{roleInfo.label}</Badge>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label={t('invitations.organizationView.actions.ariaLabel')}
                                >
                                    <Icon name="MoreHorizontal" className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {!isExpired && onResendInvitation && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleResendInvitation(invitation.id)}>
                                            <Icon name="SendHorizontal" className="mr-2 h-4 w-4" />
                                            {t('invitations.button.resendInvitation')}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}

                                {onDeleteInvitation && (
                                    <ConfirmButton
                                        aria-label={t('invitations.organizationView.delete.ariaLabel', {
                                            action: isExpired
                                                ? t('invitations.button.remove')
                                                : t('invitations.button.delete'),
                                            email: invitation.email,
                                        })}
                                        onConfirmation={() => handleDeleteInvitation(invitation.id)}
                                        header={{
                                            title: isExpired
                                                ? t('invitations.organizationView.delete.removeTitle')
                                                : t('invitations.organizationView.delete.title'),
                                            description: t('invitations.organizationView.delete.description', {
                                                action: isExpired
                                                    ? t('invitations.button.remove').toLowerCase()
                                                    : t('invitations.button.delete').toLowerCase(),
                                                email: invitation.email,
                                            }),
                                        }}
                                        content={
                                            <Alert variant={'warning'}>
                                                <Icon name="AlertCircle" className="size-4" />
                                                <AlertTitle>
                                                    {t('invitations.organizationView.delete.warning')}
                                                </AlertTitle>
                                            </Alert>
                                        }
                                        buttonLabels={{
                                            confirm: isExpired
                                                ? t('invitations.button.remove')
                                                : t('invitations.button.delete'),
                                        }}
                                        asChild
                                    >
                                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                                            <Icon name="Trash" className="mr-2 h-4 w-4" />
                                            {isExpired
                                                ? t('invitations.organizationView.delete.menuItemExpired')
                                                : t('invitations.organizationView.delete.menuItem')}
                                        </DropdownMenuItem>
                                    </ConfirmButton>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            );
        },
        [handleDeleteInvitation, handleResendInvitation, t],
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Icon name="SendHorizontal" className="h-5 w-5" />
                        {t('invitations.organizationView.title', { count: filteredInvitations.length })}
                    </CardTitle>

                    {canInviteMembers && onSendInvitation && (
                        <InvitationButton
                            onSendInvitation={onSendInvitation}
                            userRoleHierarchyLevel={currentMember?.roleHierarchyLevel}
                            onInvitationSent={onInvitationsUpdated}
                            buttonText={t('invitations.button.inviteMember')}
                            size="sm"
                        />
                    )}
                </div>

                {/* Search and filters */}
                <div className="flex flex-col gap-2 sm:flex-row">
                    <SearchInput
                        placeholder={t('invitations.organizationView.search.placeholder')}
                        value={searchQuery}
                        onChange={(e) => {
                            handleSearchQuery(e.target.value);
                        }}
                        className="shadow-none"
                    />

                    <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value)}>
                        <SelectTrigger className="h-10! w-full sm:w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('invitations.form.role.allRoles')}</SelectItem>
                            {availableRoles.map((role) => (
                                <SelectItem key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent>
                {filteredInvitations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Icon name="SendHorizontal" className="text-muted-foreground mb-4 h-12 w-12" />
                        <h3 className="mb-2 text-lg font-semibold">{t('invitations.organizationView.empty.title')}</h3>
                        <Muted>
                            {searchQuery || selectedRole !== 'all'
                                ? t('invitations.organizationView.empty.tryAdjusting')
                                : t('invitations.organizationView.empty.noDescription')}
                        </Muted>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Pending Invitations */}
                        {pendingInvitations.length > 0 && (
                            <div className="space-y-3">
                                {pendingInvitations.length > 0 && expiredInvitations.length > 0 && (
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <Icon name="CalendarCheck" className="text-muted-foreground h-4 w-4" />
                                        <span className="text-muted-foreground text-sm font-medium">
                                            {t('invitations.organizationView.sections.pending', {
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
                                            {t('invitations.organizationView.sections.expired', {
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

interface OrganizationInvitationsPageProps {
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
}

export function OrganizationInvitationsPage({ clientTrpc }: OrganizationInvitationsPageProps) {
    const {
        invitationsRes,
        handleDeleteInvitation,
        handleResendInvitation,
        canInviteMembers,
        currentMember,
        handleSendInvitation,
        handleUpdateInvitation,
    } = useOrganizationInvitationControllers({
        clientTrpc,
        toast,
    });

    if (invitationsRes.isPending || !invitationsRes.data) {
        return <Skeleton className="h-96 w-full" />;
    }

    return (
        <OrganizationInvitationsManager
            invitations={invitationsRes.data.invitations}
            onDeleteInvitation={handleDeleteInvitation}
            onResendInvitation={handleResendInvitation}
            onInvitationsUpdated={handleUpdateInvitation}
            canInviteMembers={canInviteMembers}
            currentMember={currentMember}
            onSendInvitation={handleSendInvitation}
        />
    );
}
