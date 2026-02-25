'use client';

import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { ConfirmButton } from '@kit/ui/confirm-button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Icon } from '@kit/ui/icon';
import { SearchInput } from '@kit/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kit/ui/select';
import { Skeleton } from '@kit/ui/skeleton';
import { toast } from '@kit/ui/sonner';
import { Muted } from '@kit/ui/text';
import { getInitials } from '@kit/utils';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation('p_org');
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
                    <Muted className="bg-accent flex h-6 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden duration-200 ease-linear [&>svg]:size-4 [&>svg]:shrink-0">
                        {t('organizationMembers.changeRole')}
                    </Muted>
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
                                {getRoleDisplayName(role.name)}
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
                    aria-label={t('organizationMembers.removeMember')}
                    onConfirmation={() => onRemoveMember(member.id)}
                    template="delete"
                    header={{
                        title: t('organizationMembers.removeMemberConfirmTitle'),
                        description: t('organizationMembers.removeMemberConfirmDescription', {
                            memberName: getMemberDisplayName(member),
                        }),
                    }}
                    content={t('organizationMembers.removeMemberConfirmContent')}
                    buttonLabels={{
                        confirm: t('organizationMembers.removeMemberButton'),
                    }}
                >
                    <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                        <Icon name="Trash" className="text-destructive h-4 w-4" />
                        {t('organizationMembers.remove')}
                    </DropdownMenuItem>
                </ConfirmButton>,
            ],
        ];
    }, [canEditRoles, canRemoveMembers, canModifyThisMember, isLoading, member, onRoleUpdate, onRemoveMember, t]);

    const sections = getDropdownSections();
    const hasAnyVisibleSection = sections.some(([shouldShow]) => shouldShow);

    if (!hasAnyVisibleSection) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('organizationMembers.memberActions')}>
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
    const { t } = useTranslation('p_org');
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
                toast.success(t('organizationMembers.memberRoleUpdated'));
            } catch (error) {
                toast.error(t('organizationMembers.memberRoleUpdateFailed'));
                console.error('Failed to update member role:', error);
            }
        },
        [onUpdateMemberRole, t],
    );

    const handleRemoveMember = useCallback(
        async (memberId: string) => {
            if (!onRemoveMember) return;

            try {
                await onRemoveMember(memberId);
                toast.success(t('organizationMembers.memberRemoved'));
            } catch (error) {
                toast.error(t('organizationMembers.memberRemoveFailed'));
                console.error('Failed to remove member:', error);
            }
        },
        [onRemoveMember, t],
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Icon name="Users" className="h-5 w-5" />
                        {t('organizationMembers.titleWithCount', { count: filteredMembers.length })}
                    </CardTitle>
                </div>

                {/* Search and filters */}
                <div className="flex flex-col gap-2 sm:flex-row">
                    <SearchInput
                        placeholder={t('organizationMembers.searchPlaceholder')}
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
                            <SelectItem value="all">{t('organizationMembers.allRoles')}</SelectItem>
                            {availableRoles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                    {getRoleDisplayName(role.name)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent>
                {filteredMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Icon name="Users" className="text-muted-foreground mb-4 h-12 w-12" />
                        <h3 className="mb-2 text-lg font-semibold">{t('organizationMembers.noMembersFound')}</h3>
                        <Muted>
                            {searchQuery || selectedRole !== 'all'
                                ? t('organizationMembers.adjustFilters')
                                : t('organizationMembers.noMembersYet')}
                        </Muted>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredMembers.map((member) => {
                            const isCurrentUser = member.id === currentMember.id;

                            return (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage
                                                src={member.user.profileUrl || undefined}
                                                alt={getMemberDisplayName(member)}
                                            />
                                            <AvatarFallback>{getInitials(getMemberDisplayName(member))}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{getMemberDisplayName(member)}</span>
                                                {isCurrentUser && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {t('organizationMembers.you')}
                                                    </Badge>
                                                )}
                                                {member.isOwner && (
                                                    <Badge variant="default" className="text-xs">
                                                        <Icon name="Store" className="mr-1 size-3" />
                                                        {t('organizationMembers.owner')}
                                                    </Badge>
                                                )}
                                            </div>
                                            <Muted className="text-sm">{member.user.email}</Muted>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={getRoleConfig(member.roleName, member.roleHierarchyLevel)?.color}
                                        >
                                            {getRoleConfig(member.roleName, member.roleHierarchyLevel)?.label}
                                        </Badge>

                                        <MemberActionButton
                                            member={member}
                                            canEditRoles={canEditRoles}
                                            canRemoveMembers={canRemoveMembers}
                                            onRoleUpdate={handleRoleUpdate}
                                            onRemoveMember={handleRemoveMember}
                                            availableRoles={availableRoles}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
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
        return <Skeleton className="h-68 w-full" />;
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
