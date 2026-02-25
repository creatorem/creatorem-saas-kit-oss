import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import {
    ActionSheetSelect,
    ActionSheetSelectContent,
    ActionSheetSelectItem,
    ActionSheetSelectTrigger,
    ActionSheetSelectValue,
} from '@kit/native-ui/action-sheet-select';
import { Badge } from '@kit/native-ui/badge';
import { Button } from '@kit/native-ui/button';
import { ConfirmButton } from '@kit/native-ui/confirm-button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@kit/native-ui/dropdown-menu';
import { Icon } from '@kit/native-ui/icon';
import { Section } from '@kit/native-ui/layout/section';
import { TextInput } from '@kit/native-ui/react-native';
import { Skeleton } from '@kit/native-ui/skeleton';
import { toast } from '@kit/native-ui/sonner';
import { Text } from '@kit/native-ui/text';
import { formatTimeDifference } from '@kit/utils/native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
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
    onSendInvitation?: (data: any) => Promise<{
        success: boolean;
        invitationId: string;
    }>;
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
                <View
                    key={invitation.id}
                    className={`border-border flex flex-row items-center justify-between rounded-lg border p-4 ${
                        isExpired ? 'bg-muted/30 opacity-60' : ''
                    }`}
                >
                    <View className="flex flex-row items-center gap-3">
                        <View className="bg-muted flex h-10 w-10 flex-row items-center justify-center rounded-full">
                            <Icon name="Mail" className="text-muted-foreground h-4 w-4" />
                        </View>

                        <View className="flex flex-col">
                            <View className="flex flex-row items-center gap-2">
                                <Text className="text-foreground font-medium">{invitation.email}</Text>
                                {isExpired && (
                                    <Badge variant="destructive" className="text-foreground text-xs">
                                        <Text>{t('invitations.organizationView.status.expired')}</Text>
                                    </Badge>
                                )}
                            </View>
                            <Text className="text-muted-foreground text-sm">
                                {t('invitations.organizationView.invited', {
                                    time: formatTimeDifference(invitation.createdAt),
                                })}
                            </Text>
                        </View>
                    </View>

                    <View className="flex flex-row items-center gap-2">
                        <Badge variant={roleInfo.color}>
                            <Text className="text-foreground">{roleInfo.label}</Text>
                        </Badge>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label={t('invitations.organizationView.actions.ariaLabel')}
                                >
                                    <Icon name="MoreHorizontal" size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {!isExpired && onResendInvitation && (
                                    <>
                                        <DropdownMenuItem onPress={() => handleResendInvitation(invitation.id)}>
                                            <Icon name="SendHorizontal" className="mr-2" size={16} />
                                            <Text className="text-foreground">
                                                {t('invitations.button.resendInvitation')}
                                            </Text>
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
                                        header={
                                            isExpired
                                                ? t('invitations.organizationView.delete.removeTitle')
                                                : t('invitations.organizationView.delete.title')
                                        }
                                        content={t('invitations.organizationView.delete.description', {
                                            action: isExpired
                                                ? t('invitations.button.remove').toLowerCase()
                                                : t('invitations.button.delete').toLowerCase(),
                                            email: invitation.email,
                                        })}
                                        buttonLabels={{
                                            confirm: isExpired
                                                ? t('invitations.button.remove')
                                                : t('invitations.button.delete'),
                                        }}
                                        asChild
                                    >
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            // onSelect={(e) => {
                                            //     e.preventDefault();
                                            //     openDialog(e as any);
                                            // }}
                                        >
                                            <Icon name="Trash" className="mr-2" size={16} />
                                            <Text className="text-foreground">
                                                {isExpired
                                                    ? t('invitations.organizationView.delete.menuItemExpired')
                                                    : t('invitations.organizationView.delete.menuItem')}
                                            </Text>
                                        </DropdownMenuItem>
                                    </ConfirmButton>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </View>
                </View>
            );
        },
        [handleDeleteInvitation, handleResendInvitation, t],
    );

    return (
        <View style={{ flex: 1, display: 'flex', gap: 16 }}>
            <Section
                titleSize="xl"
                className="pt-4"
                icon="SendHorizontal"
                title={t('invitations.organizationView.title', { count: filteredInvitations.length })}
            />

            {canInviteMembers && onSendInvitation && (
                <InvitationButton
                    onSendInvitation={onSendInvitation}
                    userRoleHierarchyLevel={currentMember?.roleHierarchyLevel}
                    onInvitationSent={onInvitationsUpdated}
                    buttonText={t('invitations.button.inviteMember')}
                    size="default"
                />
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View className="relative flex-1">
                    <View
                        style={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                        }}
                    >
                        <Icon name="Search" size={16} />
                    </View>
                    <TextInput
                        className={'text-foreground border-border h-10 rounded-xl border px-3 pl-10'}
                        value={searchQuery}
                        onChangeText={handleSearchQuery}
                        textAlignVertical={'center'}
                        placeholder={t('invitations.organizationView.search.placeholder')}
                    />
                </View>

                <ActionSheetSelect
                    labels={Object.fromEntries([
                        ['all', t('invitations.form.role.allRoles')],
                        ...availableRoles.map((role) => [role, role.charAt(0).toUpperCase() + role.slice(1)]),
                    ])}
                    value={selectedRole}
                    onValueChange={setSelectedRole}
                >
                    <ActionSheetSelectTrigger className="h-10">
                        <ActionSheetSelectValue />
                    </ActionSheetSelectTrigger>
                    <ActionSheetSelectContent>
                        <ActionSheetSelectItem key={'all'} value={'all'} />
                        {availableRoles.map((r) => (
                            <ActionSheetSelectItem key={r} value={r} />
                        ))}
                    </ActionSheetSelectContent>
                </ActionSheetSelect>
            </View>

            {filteredInvitations.length === 0 ? (
                <View className="flex flex-col items-center justify-center py-12 text-center">
                    <Icon name="SendHorizontal" className="text-muted-foreground mb-4 h-12 w-12" />
                    <Text className="mb-2 text-lg font-semibold">{t('invitations.organizationView.empty.title')}</Text>
                    <Text className="text-muted-foreground text-sm">
                        {searchQuery || selectedRole !== 'all'
                            ? t('invitations.organizationView.empty.tryAdjusting')
                            : t('invitations.organizationView.empty.noDescription')}
                    </Text>
                </View>
            ) : (
                <View className="flex gap-4">
                    {/* Pending Invitations */}
                    {pendingInvitations.length > 0 && (
                        <View className="flex gap-3">
                            {pendingInvitations.length > 0 && expiredInvitations.length > 0 && (
                                <View className="border-border flex items-center gap-2 border-b pb-2">
                                    <Icon name="CalendarCheck" className="text-muted-foreground h-4 w-4" />
                                    <Text className="text-muted-foreground text-sm font-medium">
                                        {t('invitations.organizationView.sections.pending', {
                                            count: pendingInvitations.length,
                                        })}
                                    </Text>
                                </View>
                            )}
                            {pendingInvitations.map((invitation) => renderInvitationItem(invitation, false))}
                        </View>
                    )}

                    {/* Expired Invitations */}
                    {expiredInvitations.length > 0 && (
                        <View className="flex gap-3">
                            {pendingInvitations.length > 0 && (
                                <View className="border-border flex items-center gap-2 border-b pt-4 pb-2">
                                    <Icon name="AlertCircle" className="text-destructive h-4 w-4" />
                                    <Text className="text-destructive text-sm font-medium">
                                        {t('invitations.organizationView.sections.expired', {
                                            count: expiredInvitations.length,
                                        })}
                                    </Text>
                                </View>
                            )}
                            {expiredInvitations.map((invitation) => renderInvitationItem(invitation, true))}
                        </View>
                    )}
                </View>
            )}
        </View>
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
        return <Skeleton className="h-48 w-full" />;
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
