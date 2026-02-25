import { AppClient } from '@kit/db';
import z from 'zod';
import { OrganizationContext, type OrganizationRoleWithPermissions } from '../shared/context';
import { OrganizationDBClient } from '../shared/server/organization-client';

type OrganizationSessionData = Pick<
    OrganizationContext,
    'organization' | 'member' | 'organizationMemberships' | 'permissions' | 'userMemberships' | 'organizationRoles'
>;

/**
 * Core function to fetch organization session data
 * This is the shared implementation used by both server components and server actions
 *
 * @throws Error if user is not a member of the organization
 * @returns Organization session data or null if organization not found
 */
async function fetchOrganizationSession(
    db: AppClient,
    organizationSlug: string,
): Promise<OrganizationSessionData | null> {
    const organizationClient = new OrganizationDBClient(db);

    const organization = await organizationClient.getOrganizationBySlug(organizationSlug);
    if (!organization) {
        return null;
    }

    const organizationMemberships = await organizationClient.getOrganizationMemberships(organization.id);
    const userMemberships = await organizationClient.getUserMemberships();
    const member = userMemberships.find((m) => m.organizationId === organization.id);

    if (!member) {
        throw new Error('User is not a member of this organization');
    }

    const rolePermissions = await organizationClient.getRolePermissions(organization.id);
    const userPermissions = rolePermissions[member.roleName] || [];

    // Fetch organization roles if user has role.manage permission
    let organizationRoles: OrganizationRoleWithPermissions[] = [];
    if (userPermissions.includes('role.manage')) {
        organizationRoles = await organizationClient.getOrganizationRoles(organization.id);
    }

    return {
        organization,
        member,
        organizationMemberships,
        userMemberships,
        permissions: userPermissions,
        organizationRoles,
    };
}

export const getOrganizationSessionSchema = z.object({
    orgSlug: z.string(),
});

/**
 * Server action to get organization session data for client-side usage
 * Uses the shared fetchOrganizationSession implementation
 */
export async function getOrganizationSessionAction(
    { orgSlug }: z.infer<typeof getOrganizationSessionSchema>,
    { db }: { db: AppClient },
) {
    return await fetchOrganizationSession(db, orgSlug);
}
