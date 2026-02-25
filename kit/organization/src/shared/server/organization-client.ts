import 'server-only';

import { AppClient, createRequirer } from '@kit/db';
import {
    and,
    desc,
    eq,
    Organization,
    OrganizationMember,
    OrgPermissionEnum,
    organizationMember,
    organizationRole,
    organizationRolePermission,
    organization as organizationTable,
} from '@kit/drizzle';
import { OrganizationRoleWithPermissions } from '../../shared/context';
import { getOrganizationSlug } from './lib/get-organization-slug';

const populatedOrganizationMemberSelector = {
    id: organizationMember.id,
    userId: organizationMember.userId,
    roleId: organizationMember.roleId,
    roleName: organizationRole.name,
    roleHierarchyLevel: organizationRole.hierarchyLevel,
    isOwner: organizationMember.isOwner,
    organizationId: organizationMember.organizationId,
    createdAt: organizationMember.createdAt,
    updatedAt: organizationMember.updatedAt,
    organization: {
        id: organizationTable.id,
        name: organizationTable.name,
        slug: organizationTable.slug,
        address: organizationTable.address,
        email: organizationTable.email,
        logoUrl: organizationTable.logoUrl,
        website: organizationTable.website,
        updatedAt: organizationTable.updatedAt,
        createdAt: organizationTable.createdAt,
    },
};

export class OrganizationDBClient {
    public client: AppClient;

    constructor(client: AppClient) {
        this.client = client;
    }

    public get = async (): Promise<Organization | null> => {
        const orgSessionSlug = await getOrganizationSlug();

        if (!orgSessionSlug) {
            return null;
        }

        return this.getOrganizationBySlug(orgSessionSlug);
    };

    public require = createRequirer(this.get, 'Organization not found');

    /**
     * Get all memberships for the current user.
     *
     * @returns
     */
    public getUserMemberships = async (): Promise<
        (OrganizationMember & {
            roleName: string;
            roleHierarchyLevel: number;
            organization: Organization;
        })[]
    > => {
        const currentUser = await this.client.user.get();

        if (!currentUser) {
            return [];
        }

        const memberships = await this.client.rls.transaction(async (tx) => {
            const memberships = await tx
                .select(populatedOrganizationMemberSelector)
                .from(organizationMember)
                .innerJoin(organizationTable, eq(organizationMember.organizationId, organizationTable.id))
                .innerJoin(organizationRole, eq(organizationMember.roleId, organizationRole.id))
                .where(eq(organizationMember.userId, currentUser.id));

            return memberships;
        });

        return memberships;
    };

    public async getOrganization(organizationId: string): Promise<Organization | null> {
        const [organization] = await this.client.rls.transaction(async (tx) => {
            return tx.select().from(organizationTable).where(eq(organizationTable.id, organizationId)).limit(1);
        });

        return organization ?? null;
    }

    public async getOrganizationMemberships(organizationId: string): Promise<
        (OrganizationMember & {
            roleName: string;
            roleHierarchyLevel: number;
            organization: Organization;
        })[]
    > {
        const memberships = await this.client.rls.transaction(async (tx) => {
            return tx
                .select(populatedOrganizationMemberSelector)
                .from(organizationMember)
                .innerJoin(organizationTable, eq(organizationMember.organizationId, organizationTable.id))
                .innerJoin(organizationRole, eq(organizationMember.roleId, organizationRole.id))
                .where(eq(organizationMember.organizationId, organizationId));
        });

        return memberships;
    }

    public async getOrganizationBySlug(slug: string): Promise<Organization | null> {
        const [organization] = await this.client.rls.transaction(async (tx) => {
            return tx.select().from(organizationTable).where(eq(organizationTable.slug, slug)).limit(1);
        });

        return organization ?? null;
    }

    public async getRolePermissions(organizationId: string): Promise<Record<string, OrgPermissionEnum[]>> {
        const permissions = await this.client.rls.transaction(async (tx) => {
            return tx
                .select({
                    roleName: organizationRole.name,
                    permissions: organizationRolePermission.permission,
                })
                .from(organizationRole)
                .innerJoin(organizationRolePermission, eq(organizationRole.id, organizationRolePermission.roleId))
                .where(eq(organizationRole.organizationId, organizationId));
        });

        return permissions.reduce(
            (acc, permission) => {
                if (!acc[permission.roleName]) {
                    acc[permission.roleName] = [];
                }
                acc[permission.roleName]!.push(permission.permissions);
                return acc;
            },
            {} as Record<string, OrgPermissionEnum[]>,
        );
    }

    /**
     * Get all roles for an organization with their permissions
     */
    public async getOrganizationRoles(organizationId: string): Promise<OrganizationRoleWithPermissions[]> {
        const rolesWithPermissions = await this.client.rls.transaction(async (tx) => {
            // Get roles
            const roles = await tx
                .select()
                .from(organizationRole)
                .where(eq(organizationRole.organizationId, organizationId))
                .orderBy(desc(organizationRole.hierarchyLevel));

            // Get permissions for each role
            const rolesWithPerms = await Promise.all(
                roles.map(async (role) => {
                    const permissions = await tx
                        .select()
                        .from(organizationRolePermission)
                        .where(
                            and(
                                eq(organizationRolePermission.roleId, role.id),
                                eq(organizationRolePermission.organizationId, role.organizationId),
                            ),
                        );

                    return {
                        ...role,
                        permissions: permissions.map((p) => p.permission),
                    };
                }),
            );

            return rolesWithPerms;
        });

        return rolesWithPermissions;
    }
}
