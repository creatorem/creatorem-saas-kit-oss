import { AppClient } from '@kit/db';
import { z } from 'zod';
import { updateRolePermissionsSchema as schema } from '../shared/schemas';
import { OrganizationRolePermissionEngine } from '../shared/server/organization-role-permission';

export const updateRolePermissionsSchema = schema;

export const updateRolePermissionsAction = async (
    { organizationId, roleId, permissions }: z.infer<typeof updateRolePermissionsSchema>,
    { db }: { db: AppClient },
) => {
    const user = await db.user.require();

    return await new OrganizationRolePermissionEngine(db).updateRolePermissions({
        organizationId,
        roleId,
        permissions,
        userId: user.id,
    });
};
