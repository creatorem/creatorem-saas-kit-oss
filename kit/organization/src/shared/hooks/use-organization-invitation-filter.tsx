import { OrganizationInvitation } from '@kit/drizzle';
import { useOrganization } from '@kit/organization/shared';
import { useCallback, useMemo, useState } from 'react';

export interface OrganizationInvitationWithRole extends OrganizationInvitation {
    roleName: string | null;
    roleHierarchyLevel: number | null;
}

// Helper function to check if invitation is expired
function isInvitationExpired(invitation: OrganizationInvitation): boolean {
    if (!invitation.expiresAt) return false;
    return new Date(invitation.expiresAt) < new Date();
}

export const useOrganizationInvitationFilter = ({ invitations }: { invitations: OrganizationInvitationWithRole[] }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<string | 'all'>('all');

    // Get organization roles from context
    const { organizationRoles } = useOrganization();

    // Sort roles from highest hierarchy value (least important) to lowest (most important)
    const availableRoles = useMemo(() => {
        return organizationRoles
            .slice() // Create a copy to avoid mutating original array
            .sort((a, b) => b.hierarchyLevel - a.hierarchyLevel)
            .map((role) => role.name);
    }, [organizationRoles]);

    // Filter invitations based on search and role
    const filteredInvitations = useMemo(() => {
        return invitations.filter((invitation) => {
            const matchesSearch =
                searchQuery === '' || invitation.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = selectedRole === 'all' || invitation.roleName === selectedRole;

            return matchesSearch && matchesRole;
        });
    }, [invitations, searchQuery, selectedRole]);

    // Group invitations by status
    const { pendingInvitations, expiredInvitations } = useMemo(() => {
        const pending: OrganizationInvitationWithRole[] = [];
        const expired: OrganizationInvitationWithRole[] = [];

        filteredInvitations.forEach((invitation) => {
            if (isInvitationExpired(invitation)) {
                expired.push(invitation);
            } else {
                pending.push(invitation);
            }
        });

        return { pendingInvitations: pending, expiredInvitations: expired };
    }, [filteredInvitations]);

    const handleSearchQuery = useCallback((newQuery: string) => {
        setSearchQuery(newQuery);
    }, []);

    return {
        filteredInvitations,
        searchQuery,
        handleSearchQuery,
        selectedRole,
        availableRoles,
        setSelectedRole,
        pendingInvitations,
        expiredInvitations,
    };
};
