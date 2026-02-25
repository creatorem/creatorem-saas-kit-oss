import { useCallback, useMemo, useState } from 'react';
import { useOrganization } from '../context';
import { OrganizationMemberWithUser } from '../types/organization-service-types';

// Helper function to get role display name
export function getRoleDisplayName(roleName: string): string {
    // Capitalize first letter and convert underscores to spaces
    return roleName.charAt(0).toUpperCase() + roleName.slice(1).replace(/_/g, ' ');
}

// Helper function to get role display configuration for dynamic roles
export function getRoleConfig(roleName: string | undefined | null, hierarchyLevel?: number | null) {
    if (!roleName) {
        return { label: 'Unknown', color: 'outline' as const };
    }

    // Determine color based on hierarchy level
    let color: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';

    if (typeof hierarchyLevel === 'number') {
        if (hierarchyLevel === 0) {
            color = 'destructive'; // Highest authority (owner level)
        } else if (hierarchyLevel <= 2) {
            color = 'default'; // High authority (admin/editor level)
        } else if (hierarchyLevel <= 4) {
            color = 'secondary'; // Medium authority (contributor level)
        } else {
            color = 'outline'; // Lower authority
        }
    }

    // Use the display name helper
    const label = getRoleDisplayName(roleName);

    return { label, color };
}

export function getMemberDisplayName(member: OrganizationMemberWithUser): string {
    return member.user.name || member.user.email || 'Unknown User';
}

export const useOrganizationMemberFilter = ({ members }: { members: OrganizationMemberWithUser[] }) => {
    const { permissions, member: currentMember, organizationRoles } = useOrganization();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<string | 'all'>('all');

    // Permission checks - using the actual permissions from the enum
    const canRemoveMembers = permissions.includes('member.manage') || currentMember.isOwner;
    const canEditRoles = permissions.includes('member.manage') || currentMember.isOwner;

    // Use organization roles from context, sorted from highest hierarchy value (least important) to lowest (most important)
    const availableRoles = useMemo(() => {
        return organizationRoles
            .slice() // Create a copy to avoid mutating original array
            .sort((a, b) => b.hierarchyLevel - a.hierarchyLevel) // Sort descending: highest hierarchy value first (least important)
            .map((role) => ({
                id: role.id,
                name: role.name,
                hierarchyLevel: role.hierarchyLevel,
            }));
    }, [organizationRoles]);

    // Filter members based on search and role
    const filteredMembers = useMemo(() => {
        return members.filter((member) => {
            const matchesSearch =
                searchQuery === '' ||
                getMemberDisplayName(member).toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.user.email?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = selectedRole === 'all' || member.roleId === selectedRole;

            return matchesSearch && matchesRole;
        });
    }, [members, searchQuery, selectedRole]);

    const handleSearchQuery = useCallback((newQuery: string) => {
        setSearchQuery(newQuery);
    }, []);

    return {
        handleSearchQuery,
        filteredMembers,
        searchQuery,
        selectedRole,
        setSelectedRole,
        availableRoles,
        canRemoveMembers,
        canEditRoles,
    };
};
