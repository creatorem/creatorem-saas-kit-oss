'use client';

import type { Organization, OrganizationMember, OrganizationRole, OrgPermissionEnum } from '@kit/drizzle';
import React, { useCallback, useEffect } from 'react';

// Extended member type with role information
export type ExtendedOrganizationMember = OrganizationMember & {
    roleName: string;
    roleHierarchyLevel: number;
};

export type OrganizationRoleWithPermissions = OrganizationRole & {
    permissions: OrgPermissionEnum[];
};

export type OrganizationContext = {
    /**
     * This is the current organization that the user is a member of.
     */
    organization: Organization;
    setOrganization: (slug: string) => void;
    /**
     * This is the list of all organizations that the user is a member of.
     * Will only be available if the user has the `organization.manage` permission.
     * Otherwise it will be an empty array.
     */
    organizationMemberships: (ExtendedOrganizationMember & { organization: Organization })[];
    /**
     * This is the current user's membership in the current organization.
     */
    member: ExtendedOrganizationMember;
    /**
     * This is the permissions of the current user.
     */
    permissions: OrgPermissionEnum[];
    /**
     * This is the list of all organizations that the user is a member of.
     *
     */
    userMemberships: (ExtendedOrganizationMember & { organization: Organization })[];
    /**
     * Organization roles with their permissions.
     * Only available if the user has the `role.read` permission.
     */
    organizationRoles: OrganizationRoleWithPermissions[];
    /**
     * Function to add a new membership when user accepts an invitation
     */
    addUserMembership: (membership: ExtendedOrganizationMember & { organization: Organization }) => void;
    /**
     * Function to update organization roles in the context
     */
    updateOrganizationRoles: (roles: OrganizationRoleWithPermissions[]) => void;
};

const organizationContext = React.createContext<OrganizationContext>({
    organization: {} as Organization,
    setOrganization: (() => {}) as (slug: string) => void,
    organizationMemberships: [],
    member: {} as ExtendedOrganizationMember,
    permissions: [],
    userMemberships: [],
    organizationRoles: [],
    addUserMembership: () => {},
    updateOrganizationRoles: () => {},
});

export const useOrganization = () => {
    const context = React.useContext(organizationContext);

    if (!context) {
        throw new Error('useOrganization must be used within a OrganizationProvider');
    }

    return context;
};

export const OrganizationProviderFromContext: React.FC<
    Omit<
        OrganizationContext,
        | 'addUserMembership'
        | 'updateOrganizationRoles'
        | 'addOrganizationRole'
        | 'updateOrganizationRole'
        | 'removeOrganizationRole'
        | 'setOrganization'
    > &
        React.PropsWithChildren & {
            organizationSlug: string;
        }
> = ({
    children,
    userMemberships: initialUserMemberships,
    organizationRoles: initialOrganizationRoles,
    organization,
    organizationSlug,
    ...props
}) => {
    const [org, setOrg] = React.useState<Organization>(organization);
    const [userMemberships, setUserMemberships] = React.useState(initialUserMemberships);
    const [organizationRoles, setOrganizationRoles] = React.useState(initialOrganizationRoles);

    useEffect(() => {
        const selectedOrg = userMemberships
            .map(({ organization: o }) => o)
            .find((o) => (o.slug === organizationSlug ? o : null));
        if (selectedOrg) {
            setOrg(selectedOrg);
        }
    }, [organizationSlug, userMemberships]);

    useEffect(() => {
        setUserMemberships(initialUserMemberships);
    }, [initialUserMemberships]);

    useEffect(() => {
        setOrganizationRoles(initialOrganizationRoles);
    }, [initialOrganizationRoles]);

    const addUserMembership = React.useCallback(
        (membership: ExtendedOrganizationMember & { organization: Organization }) => {
            setUserMemberships((prevMemberships) => {
                // Check if membership already exists to avoid duplicates
                const exists = prevMemberships.some((m) => m.organizationId === membership.organizationId);
                if (exists) {
                    return prevMemberships;
                }
                return [...prevMemberships, membership];
            });
        },
        [],
    );

    const updateOrganizationRoles = React.useCallback((roles: OrganizationRoleWithPermissions[]) => {
        setOrganizationRoles(roles);
    }, []);

    const updateOrganization = useCallback(
        (slug: string) => {
            const selectedOrg = userMemberships
                .map(({ organization: o }) => o)
                .find((o) => (o.slug === slug ? o : null));
            if (!selectedOrg) {
                throw new Error(`No organization with slug ${slug} is attached to the current user.`);
            }
            setOrg(selectedOrg);
        },
        [setOrg, userMemberships],
    );

    const contextValue = React.useMemo(
        () => ({
            ...props,
            organization: org,
            setOrganization: updateOrganization,
            userMemberships,
            organizationRoles,
            addUserMembership,
            updateOrganizationRoles,
        }),
        [
            props,
            userMemberships,
            org,
            updateOrganization,
            organizationRoles,
            addUserMembership,
            updateOrganizationRoles,
        ],
    );

    return <organizationContext.Provider value={contextValue}>{children}</organizationContext.Provider>;
};
