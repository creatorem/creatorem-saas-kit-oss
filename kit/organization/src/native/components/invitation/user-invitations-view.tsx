/**
 * todo: can be factoried even more
 */

import { Avatar, AvatarFallback, AvatarImage } from '@kit/native-ui/avatar';
import { Badge } from '@kit/native-ui/badge';
import { ConfirmButton } from '@kit/native-ui/confirm-button';
import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon } from '@kit/native-ui/icon';
import { Section } from '@kit/native-ui/layout/section';
import { toast } from '@kit/native-ui/sonner';
import { Text } from '@kit/native-ui/text';
import { getInitials } from '@kit/utils';
import { formatTimeDifference } from '@kit/utils/native';
import { useCallback, useMemo, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';
import { UserInvitationWithOrganization } from '../../../shared/invitation/hooks/use-invitation-responder';
import { useInvitationSearch } from '../../../shared/invitation/hooks/use-invitation-search';

interface UserInvitationsPageProps {
    invitations: UserInvitationWithOrganization[];
    onAcceptInvitation?: (invitationId: string) => Promise<void>;
    onDeclineInvitation?: (invitationId: string) => Promise<void>;
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
}: UserInvitationsPageProps) {
    const { t } = useTranslation('p_org-settings');
    const { searchQuery, setSearchQuery, filteredInvitations } = useInvitationSearch({ invitations });
    const colors = useThemeColors();
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

    // Render invitation item
    const renderInvitationItem = useCallback(
        (invitation: UserInvitationWithOrganization, isExpired: boolean = false) => {
            const roleInfo = getRoleConfig(
                invitation.organizationRole.name,
                invitation.organizationRole.hierarchyLevel,
                t as unknown as (key: string) => string,
            );

            return (
                <View key={invitation.id} className="border-border flex gap-3 rounded-xl border p-4">
                    {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}> */}
                    <View className="flex flex-row items-center gap-3">
                        <Avatar alt={invitation.organization.name} className="h-8 w-8">
                            <AvatarImage
                                source={{ uri: invitation.organization.logoUrl ?? undefined }}
                                className="border-border h-8 w-8 border"
                            />
                            <AvatarFallback>
                                <View className="bg-muted border-border my-auto flex h-8 w-8 items-center justify-center rounded-full border">
                                    <Text className="text-foreground text-lg font-semibold">
                                        {getInitials(invitation.organization.name)}
                                    </Text>
                                </View>
                            </AvatarFallback>
                        </Avatar>

                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text className="text-foreground text-lg font-semibold">
                                    {invitation.organization.name}
                                </Text>
                                {isExpired && (
                                    <Badge variant="destructive">
                                        <Text className="text-foreground">
                                            {t('invitations.userView.status.expired')}
                                        </Text>
                                    </Badge>
                                )}
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                <Text className="text-foreground">{t('invitations.userView.invitedAs')}</Text>
                                <Badge variant={roleInfo.color}>
                                    <Text className="text-foreground">{roleInfo.label}</Text>
                                </Badge>
                            </View>
                            <Text className="text-muted-foreground">
                                {t('invitations.userView.invited', {
                                    time: formatTimeDifference(invitation.createdAt),
                                })}
                            </Text>
                        </View>
                    </View>

                    <View className="flex w-full flex-row gap-3">
                        {onDeclineInvitation && (
                            <ConfirmButton
                                onConfirmation={() => handleDeclineInvitation(invitation.id)}
                                header={
                                    isExpired
                                        ? t('invitations.userView.decline.removeHeader')
                                        : t('invitations.userView.decline.header')
                                }
                                variant="destructive_ghost"
                                content={`${t('invitations.userView.decline.content', {
                                    action: isExpired
                                        ? t('invitations.button.remove').toLowerCase()
                                        : t('invitations.button.decline').toLowerCase(),
                                    organizationName: invitation.organization.name,
                                })}${!isExpired ? t('invitations.userView.decline.contentWarning') : ''}`}
                                buttonLabels={{
                                    confirm: isExpired
                                        ? t('invitations.button.remove')
                                        : t('invitations.button.decline'),
                                }}
                                disabled={isPending}
                                className="flex-1"
                            >
                                <Icon name="X" size={16} color={colors['--color-destructive']} />
                                <Text>{t('invitations.button.decline')}</Text>
                            </ConfirmButton>
                        )}

                        {!isExpired && (
                            <ConfirmButton
                                className="flex-1"
                                onConfirmation={() => handleAcceptInvitation(invitation.id)}
                                header={t('invitations.userView.accept.header', {
                                    organizationName: invitation.organization.name,
                                })}
                                content={t('invitations.userView.accept.content', {
                                    organizationName: invitation.organization.name,
                                    roleName: roleInfo.label,
                                })}
                                disabled={isPending || processingInvitations.has(invitation.id)}
                            >
                                {processingInvitations.has(invitation.id) ? (
                                    <Text className="text-foreground">{t('invitations.button.accepting')}</Text>
                                ) : (
                                    <>
                                        <Icon name="Check" size={16} />
                                        <Text className="text-foreground">{t('invitations.button.accept')}</Text>
                                    </>
                                )}
                            </ConfirmButton>
                        )}
                    </View>
                </View>
            );
        },
        [handleAcceptInvitation, handleDeclineInvitation, isPending, processingInvitations, t, colors],
    );

    return (
        <View style={{ flex: 1, display: 'flex', gap: 16 }}>
            <Section
                titleSize="xl"
                className="pt-8"
                icon="SendHorizontal"
                title={t('invitations.userView.title', { count: filteredInvitations.length })}
            />

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
                    onChangeText={setSearchQuery}
                    textAlignVertical={'center'}
                    placeholder={t('invitations.userView.search.placeholder')}
                />
            </View>
            {filteredInvitations.length === 0 ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
                    <Icon name="SendHorizontal" size={48} className="mb-4 opacity-0.5" />
                    <Text className="mb-2 text-lg font-semibold">
                        {searchQuery
                            ? t('invitations.userView.empty.noMatching')
                            : t('invitations.userView.empty.noInvitations')}
                    </Text>
                    <Text className="text-muted-foreground">
                        {searchQuery
                            ? t('invitations.userView.empty.tryAdjusting')
                            : t('invitations.userView.empty.noDescription')}
                    </Text>
                </View>
            ) : (
                <View style={{ gap: 16 }}>
                    {/* Pending Invitations */}
                    {pendingInvitations.length > 0 && (
                        <View style={{ gap: 12 }}>
                            {pendingInvitations.length > 0 && expiredInvitations.length > 0 && (
                                <View className="border-border flex flex-row items-center justify-between rounded-xl border p-4">
                                    <Icon name="CalendarCheck" size={16} />
                                    <Text style={{ fontSize: 14, fontWeight: '500' }}>
                                        {t('invitations.userView.sections.pending', {
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
                        <View style={{ gap: 12 }}>
                            {pendingInvitations.length > 0 && (
                                <View className="border-border flex flex-row items-center justify-between rounded-xl border p-4">
                                    <Icon name="AlertCircle" size={16} />
                                    <Text style={{ fontSize: 14, fontWeight: '500' }}>
                                        {t('invitations.userView.sections.expired', {
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
