import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
// import { SearchInput } from '@kit/native-ui/search-input';
import {
    ActionSheetSelect,
    ActionSheetSelectContent,
    ActionSheetSelectItem,
    ActionSheetSelectTrigger,
    ActionSheetSelectValue,
} from '@kit/native-ui/action-sheet-select';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/native-ui/avatar';
import { Badge } from '@kit/native-ui/badge';
import { Button } from '@kit/native-ui/button';
import { ConfirmButton } from '@kit/native-ui/confirm-button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@kit/native-ui/dropdown-menu';
import { Icon } from '@kit/native-ui/icon';
import { Section } from '@kit/native-ui/layout/section';
import { TextInput } from '@kit/native-ui/react-native';
import { Skeleton } from '@kit/native-ui/skeleton';
import { toast } from '@kit/native-ui/sonner';
import { Text } from '@kit/native-ui/text';
import { getInitials } from '@kit/utils';
import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { organizationRouter } from '../../router/router';
import { useOrganization } from '../../shared/context';
import {
    getMemberDisplayName,
    getRoleConfig,
    getRoleDisplayName,
    useOrganizationMemberFilter,
} from '../../shared/hooks/use-organization-member-filter';
import { useOrganizationMembersRolesRes } from '../../shared/hooks/use-organization-members-roles-res';
import type { OrganizationMemberWithUser } from '../../shared/types/organization-service-types';
import { useHasHigherRoleThan } from '../../shared/use-has-higher-role-than';

interface OrganizationMembersManagerProps {
    members: OrganizationMemberWithUser[];
    onUpdateMemberRole?: (memberId: string, roleId: string, roleName: string) => Promise<void>;
    onRemoveMember?: (memberId: string) => Promise<void>;
}

function MemberActionButton({
    member,
    canEditRoles,
    canRemoveMembers,
    onRoleUpdate,
    onRemoveMember,
    availableRoles,
}: {
    member: OrganizationMemberWithUser;
    canEditRoles: boolean;
    canRemoveMembers: boolean;
    onRoleUpdate: (memberId: string, roleId: string, roleName: string) => void;
    onRemoveMember: (memberId: string) => void;
    availableRoles: Array<{ id: string; name: string; hierarchyLevel: number }>;
}) {
    const { member: currentMember } = useOrganization();
    const { data: hasHigherRole, isLoading, error } = useHasHigherRoleThan({ memberId: member.userId });

    const canModifyThisMember = member.id !== currentMember.id && (hasHigherRole || false);

    useEffect(() => {
        if (error) {
            console.error('Failed to check role hierarchy for member:', member.id, error);
        }
    }, [error, member.id]);

    const getDropdownSections = useCallback((): [boolean, React.ReactNode][] => {
        return [
            [
                canEditRoles && canModifyThisMember && !isLoading,
                <>
                    <Text className="bg-accent flex h-6 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden duration-200 ease-linear [&>svg]:size-4 [&>svg]:shrink-0">
                        Change Role
                    </Text>
                    <DropdownMenuRadioGroup
                        value={member.roleId}
                        onValueChange={(roleId) => {
                            const selectedRole = availableRoles.find((r) => r.id === roleId);
                            if (selectedRole) {
                                onRoleUpdate(member.id, roleId, selectedRole.name);
                            }
                        }}
                    >
                        {availableRoles.map((role) => (
                            <DropdownMenuRadioItem key={role.id} value={role.id}>
                                <Text>{getRoleDisplayName(role.name)}</Text>
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                </>,
            ],
            [
                canRemoveMembers && canModifyThisMember && !isLoading,
                <ConfirmButton
                    asChild
                    key="remove-button"
                    aria-label={`Remove ${getMemberDisplayName(member)} from organization`}
                    onConfirmation={() => onRemoveMember(member.id)}
                    template="delete"
                    header="Remove Member"
                    content={`Are you sure you want to remove ${getMemberDisplayName(member)} from the organization?`}
                    buttonLabels={{
                        confirm: 'Remove Member',
                    }}
                >
                    <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                        <Icon name="Trash" className="text-destructive h-4 w-4" />
                        <Text>Remove</Text>
                    </DropdownMenuItem>
                </ConfirmButton>,
            ],
        ];
    }, [canEditRoles, canRemoveMembers, canModifyThisMember, isLoading, member, onRoleUpdate, onRemoveMember]);

    const sections = getDropdownSections();
    const hasAnyVisibleSection = sections.some(([shouldShow]) => shouldShow);

    if (!hasAnyVisibleSection) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Member actions">
                    <Icon name="MoreHorizontal" className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                {sections.map(
                    ([shouldShow, content], index) =>
                        shouldShow && <React.Fragment key={index}>{content}</React.Fragment>,
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function InternalOrganizationMembersManager({
    members,
    onUpdateMemberRole,
    onRemoveMember,
}: OrganizationMembersManagerProps) {
    const {
        filteredMembers,
        searchQuery,
        selectedRole,
        setSelectedRole,
        canEditRoles,
        canRemoveMembers,
        availableRoles,
        handleSearchQuery,
    } = useOrganizationMemberFilter({ members });
    const { member: currentMember } = useOrganization();

    const handleRoleUpdate = useCallback(
        async (memberId: string, roleId: string, roleName: string) => {
            if (!onUpdateMemberRole) return;

            try {
                await onUpdateMemberRole(memberId, roleId, roleName);
                toast.success('Member role updated successfully');
            } catch (error) {
                toast.error('Failed to update member role');
                console.error('Failed to update member role:', error);
            }
        },
        [onUpdateMemberRole],
    );

    const handleRemoveMember = useCallback(
        async (memberId: string) => {
            if (!onRemoveMember) return;

            try {
                await onRemoveMember(memberId);
                toast.success('Member removed successfully');
            } catch (error) {
                toast.error('Failed to remove member');
                console.error('Failed to remove member:', error);
            }
        },
        [onRemoveMember],
    );

    return (
        <View style={{ flex: 1, display: 'flex', gap: 16 }}>
            <Section
                titleSize="xl"
                className="pt-4"
                icon="Users"
                title={`Organization Members (${filteredMembers.length})`}
            />

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
                        placeholder="Search members by name or email..."
                    />
                </View>

                <ActionSheetSelect
                    labels={Object.fromEntries([
                        // ['all', 'All Roles'],
                        ...availableRoles.map((r) => [r.name, r.name]),
                    ])}
                    value={selectedRole}
                    onValueChange={setSelectedRole}
                >
                    <ActionSheetSelectTrigger className="h-10">
                        <ActionSheetSelectValue />
                    </ActionSheetSelectTrigger>
                    <ActionSheetSelectContent>
                        {/* <ActionSheetSelectItem key={'all'} value={'all'} /> */}
                        {availableRoles.map((r) => (
                            <ActionSheetSelectItem key={r.id} value={r.name} />
                        ))}
                    </ActionSheetSelectContent>
                </ActionSheetSelect>
            </View>

            {filteredMembers.length === 0 ? (
                <View className="flex flex-col items-center justify-center py-12 text-center">
                    <Icon name="Users" className="text-muted-foreground mb-4 h-12 w-12" />
                    <Text className="mb-2 text-lg font-semibold">No members found</Text>
                    <Text className="text-muted-foreground text-sm">
                        {searchQuery || selectedRole !== 'all'
                            ? 'Try adjusting your search or filter criteria.'
                            : "Your organization doesn't have any members yet."}
                    </Text>
                </View>
            ) : (
                <View className="space-y-3">
                    {filteredMembers.map((member) => {
                        const isCurrentUser = member.id === currentMember.id;

                        return (
                            <View
                                key={member.id}
                                className="border-border flex flex-row items-center justify-between rounded-lg border p-4"
                            >
                                <View className="flex flex-row items-center gap-3">
                                    <Avatar alt={getMemberDisplayName(member)}>
                                        <AvatarImage src={member.user.profileUrl || undefined} />
                                        <AvatarFallback>
                                            <Text>{getInitials(getMemberDisplayName(member))}</Text>
                                        </AvatarFallback>
                                    </Avatar>

                                    <View className="flex flex-col">
                                        <View className="flex flex-row items-center gap-2">
                                            <Text className="font-medium">{getMemberDisplayName(member)}</Text>
                                            {isCurrentUser && (
                                                <Badge variant="outline" className="text-xs">
                                                    <Text>You</Text>
                                                </Badge>
                                            )}
                                            {member.isOwner && (
                                                <Badge variant="default" className="text-xs">
                                                    <Icon name="Store" size={12} />
                                                    <Text className="text-foreground">Owner</Text>
                                                </Badge>
                                            )}
                                        </View>
                                        <Text className="text-muted-foreground text-sm">{member.user.email}</Text>
                                    </View>
                                </View>

                                <View className="flex flex-row items-center gap-2">
                                    <Badge variant={getRoleConfig(member.roleName, member.roleHierarchyLevel)?.color}>
                                        <Text>{getRoleConfig(member.roleName, member.roleHierarchyLevel)?.label}</Text>
                                    </Badge>

                                    <MemberActionButton
                                        member={member}
                                        canEditRoles={canEditRoles}
                                        canRemoveMembers={canRemoveMembers}
                                        onRoleUpdate={handleRoleUpdate}
                                        onRemoveMember={handleRemoveMember}
                                        availableRoles={availableRoles}
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}
export function OrganizationMembersManager({
    clientTrpc,
}: {
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
}) {
    const { membersRes, /* rolesRes, */ handleUpdateMemberRole, handleRemoveMember } = useOrganizationMembersRolesRes({
        clientTrpc,
    });

    if (membersRes.isLoading || !membersRes.data /*  || rolesRes.isLoading || !rolesRes.data */) {
        return <Skeleton className="h-48 w-full" />;
    }

    return (
        <InternalOrganizationMembersManager
            members={membersRes.data.members}
            // roles={rolesRes.data}
            onUpdateMemberRole={handleUpdateMemberRole}
            onRemoveMember={handleRemoveMember}
        />
    );
}
