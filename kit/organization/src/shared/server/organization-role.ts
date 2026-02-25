import { AppClient } from '@kit/db';
import { and, eq, ne, organizationMember, organizationRole } from '@kit/drizzle';
import { logger } from '@kit/utils';

interface CreateRoleParams {
    organizationId: string;
    name: string;
    hierarchyLevel: number;
    userId: string;
}

interface UpdateRoleParams {
    organizationId: string;
    roleId: string;
    name?: string;
    hierarchyLevel?: number;
    userId: string;
}

interface DeleteRoleParams {
    organizationId: string;
    roleId: string;
    userId: string;
}

/**
 * Engine class for organization role management operations
 * Uses Drizzle ORM with RLS for secure database operations
 */
export class OrganizationRoleEngine {
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
     * Create a new organization role
     */
    async createRole(params: CreateRoleParams): Promise<{ success: boolean; role?: any; error?: string }> {
        const { organizationId, name, hierarchyLevel, userId } = params;

        try {
            // Check permissions
            const hasPermission = await this.checkRoleManagePermission(organizationId);
            if (!hasPermission) {
                return { success: false, error: 'You do not have permission to manage roles' };
            }

            // Use transaction for all operations
            const result = await this.db.rls.transaction(async (tx) => {
                // Check if role name already exists
                const existingRole = await tx
                    .select()
                    .from(organizationRole)
                    .where(and(eq(organizationRole.name, name), eq(organizationRole.organizationId, organizationId)))
                    .limit(1);

                if (existingRole.length > 0) {
                    return { success: false, error: 'A role with this name already exists' };
                }

                // Create the new role
                const [newRole] = await tx
                    .insert(organizationRole)
                    .values({
                        name,
                        hierarchyLevel,
                        organizationId,
                    })
                    .returning();

                return { success: true, role: newRole };
            });

            if (!result.success) {
                return result;
            }

            logger.info(`Role created: ${result.role?.id} by user ${userId}`);

            return result;
        } catch (error) {
            logger.error({ error, params }, 'Failed to create role');
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create role',
            };
        }
    }

    /**
     * Update an existing organization role
     */
    async updateRole(params: UpdateRoleParams): Promise<{ success: boolean; role?: any; error?: string }> {
        const { organizationId, roleId, name, hierarchyLevel, userId } = params;

        try {
            // Check permissions
            const hasPermission = await this.checkRoleManagePermission(organizationId);
            if (!hasPermission) {
                return { success: false, error: 'You do not have permission to manage roles' };
            }

            // Use transaction for all operations
            const result = await this.db.rls.transaction(async (tx) => {
                // Check if role exists and belongs to organization
                const existingRole = await tx
                    .select()
                    .from(organizationRole)
                    .where(and(eq(organizationRole.id, roleId), eq(organizationRole.organizationId, organizationId)))
                    .limit(1);

                if (existingRole.length === 0) {
                    return { success: false, error: 'Role not found' };
                }

                // Check if name is being changed and if new name already exists
                if (name && existingRole[0] && name !== existingRole[0].name) {
                    const duplicateRole = await tx
                        .select()
                        .from(organizationRole)
                        .where(
                            and(
                                eq(organizationRole.name, name),
                                eq(organizationRole.organizationId, organizationId),
                                ne(organizationRole.id, roleId),
                            ),
                        )
                        .limit(1);

                    if (duplicateRole.length > 0) {
                        return { success: false, error: 'A role with this name already exists' };
                    }
                }

                // Prepare update values
                const updateValues: Partial<typeof organizationRole.$inferInsert> = {};
                if (name !== undefined) updateValues.name = name;
                if (hierarchyLevel !== undefined) updateValues.hierarchyLevel = hierarchyLevel;
                updateValues.updatedAt = new Date().toISOString();

                // Update the role
                const [updatedRole] = await tx
                    .update(organizationRole)
                    .set(updateValues)
                    .where(eq(organizationRole.id, roleId))
                    .returning();

                return { success: true, role: updatedRole };
            });

            if (!result.success) {
                return result;
            }

            logger.info(`Role updated: ${roleId} by user ${userId}`);

            return result;
        } catch (error) {
            logger.error({ error, params }, 'Failed to update role');
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update role',
            };
        }
    }

    /**
     * Delete an organization role
     */
    async deleteRole(params: DeleteRoleParams): Promise<{ success: boolean; error?: string }> {
        const { organizationId, roleId, userId } = params;

        try {
            // Check permissions
            const hasPermission = await this.checkRoleManagePermission(organizationId);
            if (!hasPermission) {
                return { success: false, error: 'You do not have permission to manage roles' };
            }

            // Use transaction for all operations
            const result = await this.db.rls.transaction(async (tx) => {
                // Check if role exists and belongs to organization
                const existingRole = await tx
                    .select()
                    .from(organizationRole)
                    .where(and(eq(organizationRole.id, roleId), eq(organizationRole.organizationId, organizationId)))
                    .limit(1);

                if (existingRole.length === 0) {
                    return { success: false, error: 'Role not found' };
                }

                const roleToDelete = existingRole[0];
                if (!roleToDelete) {
                    return { success: false, error: 'Role not found' };
                }

                // Get all roles for this organization to check if it's the last one
                const allOrgRoles = await tx
                    .select()
                    .from(organizationRole)
                    .where(eq(organizationRole.organizationId, organizationId));

                if (allOrgRoles.length === 1) {
                    return { success: false, error: 'Cannot delete the last role in an organization' };
                }

                // Check if any members have this role
                const membersWithRole = await tx
                    .select()
                    .from(organizationMember)
                    .where(eq(organizationMember.roleId, roleId));

                if (membersWithRole.length > 0) {
                    // Find replacement role based on hierarchy
                    const currentHierarchy = roleToDelete.hierarchyLevel;

                    // Sort all other roles by hierarchy
                    const otherRoles = allOrgRoles
                        .filter((r) => r.id !== roleId)
                        .sort((a, b) => a.hierarchyLevel - b.hierarchyLevel);

                    // Find roles at same level, below, and above
                    const sameLevel = otherRoles.filter((r) => r.hierarchyLevel === currentHierarchy);
                    const below = otherRoles.filter((r) => r.hierarchyLevel < currentHierarchy);
                    const above = otherRoles.filter((r) => r.hierarchyLevel > currentHierarchy);

                    let replacementRole = null;

                    // Priority 1: Same hierarchical level
                    if (sameLevel.length > 0) {
                        replacementRole = sameLevel[0];
                    }
                    // Priority 2: Closest number below (higher authority)
                    else if (below.length > 0) {
                        replacementRole = below[below.length - 1]; // Last element is closest
                    }
                    // Priority 3: Closest number above (lower authority)
                    else if (above.length > 0) {
                        replacementRole = above[0]; // First element is closest
                    }

                    if (!replacementRole) {
                        return { success: false, error: 'Failed to find replacement role' };
                    }

                    // Update all members with this role to the replacement role
                    await tx
                        .update(organizationMember)
                        .set({
                            roleId: replacementRole.id,
                            updatedAt: new Date().toISOString(),
                        })
                        .where(eq(organizationMember.roleId, roleId));

                    logger.info(
                        `Reassigned ${membersWithRole.length} members from role ${roleId} to ${replacementRole.id}`,
                    );
                }

                // Delete the role (cascade will delete permissions)
                await tx.delete(organizationRole).where(eq(organizationRole.id, roleId));

                return { success: true };
            });

            if (!result.success) {
                return result;
            }

            logger.info(`Role deleted: ${roleId} by user ${userId}`);

            return { success: true };
        } catch (error) {
            logger.error({ error, params }, 'Failed to delete role');
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete role',
            };
        }
    }
}
