import { orgPermission } from '@kit/drizzle';
import { z } from 'zod';

/**
 * Role Management Schemas
 *
 * Note on role deletion behavior:
 * - All roles can be deleted (including default roles like 'editor' and 'contributor')
 * - When a role is deleted and members are assigned to it, they are automatically reassigned:
 *   1. To another role at the same hierarchy level (if available)
 *   2. To the closest role with higher authority (lower hierarchy number)
 *   3. To the closest role with lower authority (higher hierarchy number)
 * - The last role in an organization cannot be deleted
 */

// Schema for creating a new organization role
export const createOrganizationRoleSchema = z.object({
    organizationId: z.string().uuid('Invalid organization ID'),
    name: z
        .string()
        .min(1, 'Role name is required')
        .max(100, 'Role name must be less than 100 characters')
        .regex(
            /^[a-z][a-z0-9_]*$/,
            'Role name must start with a letter and contain only lowercase letters, numbers, and underscores',
        ),
    hierarchyLevel: z
        .number()
        .int()
        .min(0, 'Hierarchy level must be 0 or greater')
        .max(10, 'Hierarchy level must be 10 or less'),
});

// Schema for updating an organization role
export const updateOrganizationRoleSchema = z.object({
    organizationId: z.string().uuid('Invalid organization ID'),
    roleId: z.string().uuid('Invalid role ID'),
    name: z
        .string()
        .min(1, 'Role name is required')
        .max(100, 'Role name must be less than 100 characters')
        .regex(
            /^[a-z][a-z0-9_]*$/,
            'Role name must start with a letter and contain only lowercase letters, numbers, and underscores',
        )
        .optional(),
    hierarchyLevel: z
        .number()
        .int()
        .min(0, 'Hierarchy level must be 0 or greater')
        .max(10, 'Hierarchy level must be 10 or less')
        .optional(),
});

// Schema for deleting an organization role
export const deleteOrganizationRoleSchema = z.object({
    organizationId: z.string().uuid('Invalid organization ID'),
    roleId: z.string().uuid('Invalid role ID'),
});

// Schema for updating role permissions
export const updateRolePermissionsSchema = z.object({
    organizationId: z.string().uuid('Invalid organization ID'),
    roleId: z.string().uuid('Invalid role ID'),
    permissions: z.array(z.enum(orgPermission.enumValues)),
});

// Types
export type CreateOrganizationRoleInput = z.infer<typeof createOrganizationRoleSchema>;
export type UpdateOrganizationRoleInput = z.infer<typeof updateOrganizationRoleSchema>;
export type DeleteOrganizationRoleInput = z.infer<typeof deleteOrganizationRoleSchema>;
export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;
