import { AppClient } from '@kit/db';
import { and, eq, inArray, type OrgPermissionEnum, organizationRole, organizationRolePermission } from '@kit/drizzle';
import { logger } from '@kit/utils';

interface UpdatePermissionsParams {
    organizationId: string;
    roleId: string;
    permissions: OrgPermissionEnum[];
    userId: string;
}

/**
 * Engine class for organization role permission management operations
 * Uses Drizzle ORM with RLS for secure database operations
 */
export class OrganizationRolePermissionEngine {
    private db: AppClient;

    constructor(db: AppClient) {
        this.db = db;
    }

    /**
     * Check if user has permission to manage roles
     */
    private async checkRoleManagePermission(organizationId: string): Promise<boolean> {
        try {
            const result = await this.db.supabase.schema('kit').rpc('has_org_permission', {
                org_id: organizationId,
                permission_name: 'role.manage',
            });

            return result.data ?? false;
        } catch (error) {
            logger.error({ error, organizationId }, 'Failed to check role manage permission');
            return false;
        }
    }

    /**
     * Update permissions for a role
     */
    async updateRolePermissions(params: UpdatePermissionsParams): Promise<{ error: string } | { success: true }> {
        const { organizationId, roleId, permissions, userId } = params;

        try {
            // Check permissions
            const hasPermission = await this.checkRoleManagePermission(organizationId);
            if (!hasPermission) {
                return { error: 'You do not have permission to manage roles' };
            }
            // Use transaction for all operations
            const res = await this.db.rls.transaction(async (tx) => {
                // Check if role exists and belongs to organization
                const existingRoleList = await tx
                    .select()
                    .from(organizationRole)
                    .where(and(eq(organizationRole.id, roleId), eq(organizationRole.organizationId, organizationId)))
                    .limit(1);

                const existingRole = existingRoleList[0];

                if (!existingRole) {
                    throw new Error('Role not found');
                }

                const previousPremissionRoles = await tx
                    .select()
                    .from(organizationRolePermission)
                    .where(
                        and(
                            eq(organizationRolePermission.roleId, roleId),
                            eq(organizationRolePermission.organizationId, organizationId),
                        ),
                    );

                // Extract current permission strings
                const currentPermissions = previousPremissionRoles.map((p) => p.permission);

                // Find permissions to delete (in current but not in new)
                const permissionsToDelete = currentPermissions.filter((p) => !permissions.includes(p));

                // Find permissions to add (in new but not in current)
                const permissionsToAdd = permissions.filter((p) => !currentPermissions.includes(p));

                if (permissionsToDelete.includes('role.manage')) {
                    const { data: hasMultiple } = await this.db.supabase
                        .schema('kit')
                        .rpc('has_multiple_role_manage_permissions', {
                            org_id: organizationId,
                        });

                    if (!hasMultiple) {
                        return {
                            error: 'Cannot remove role.manage permission. At least one role must have this permission to manage roles.',
                        };
                    }
                }

                // Delete removed permissions
                if (permissionsToDelete.length > 0) {
                    await tx
                        .delete(organizationRolePermission)
                        .where(
                            and(
                                eq(organizationRolePermission.roleId, roleId),
                                eq(organizationRolePermission.organizationId, organizationId),
                                inArray(organizationRolePermission.permission, permissionsToDelete),
                            ),
                        );
                }

                // Add new permissions
                if (permissionsToAdd.length > 0) {
                    await tx.insert(organizationRolePermission).values(
                        permissionsToAdd.map((permission) => ({
                            roleId,
                            organizationId,
                            permission: permission as any,
                        })),
                    );
                }
            });

            if (res) {
                return res;
            }

            logger.info({ permissions }, `Role permissions updated: ${roleId} by user ${userId}`);

            return { success: true };
        } catch (error) {
            logger.error({ error, params }, 'Failed to update role permissions');
            return {
                error: error instanceof Error ? error.message : 'Failed to update role permissions',
            };
        }
    }

    /**
     * Get permissions for a specific role
     */
    async getRolePermissions(roleId: string): Promise<string[]> {
        const permissions = await this.db.rls.transaction(async (tx) => {
            return await tx
                .select()
                .from(organizationRolePermission)
                .where(eq(organizationRolePermission.roleId, roleId));
        });

        return permissions.map((p) => p.permission);
    }

    /**
     * Check if a role has a specific permission
     */
    async roleHasPermission(roleId: string, permission: string): Promise<boolean> {
        const result = await this.db.rls.transaction(async (tx) => {
            return await tx
                .select()
                .from(organizationRolePermission)
                .where(
                    and(
                        eq(organizationRolePermission.roleId, roleId),
                        eq(organizationRolePermission.permission, permission as any),
                    ),
                )
                .limit(1);
        });

        return result.length > 0;
    }
}
