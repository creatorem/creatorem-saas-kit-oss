import { AppClient } from '@kit/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { deleteOrganizationRoleSchema as schema } from '../shared/schemas';
import { OrganizationRoleEngine } from '../shared/server/organization-role';

export const deleteOrganizationRoleSchema = schema;

export const deleteOrganizationRoleAction = async (
    { organizationId, roleId }: z.infer<typeof deleteOrganizationRoleSchema>,
    { db }: { db: AppClient },
) => {
    const user = await db.user.require();

    const result = await new OrganizationRoleEngine(db).deleteRole({
        organizationId,
        roleId,
        userId: user.id,
    });

    if (!result.success) {
        throw new Error(result.error || 'Failed to delete role');
    }

    revalidatePath('/', 'layout');

    return {
        success: true,
    };
};
