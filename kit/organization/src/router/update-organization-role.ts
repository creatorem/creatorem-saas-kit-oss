import { AppClient } from '@kit/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { updateOrganizationRoleSchema as schema } from '../shared/schemas';
import { OrganizationRoleEngine } from '../shared/server/organization-role';

export const updateOrganizationRoleSchema = schema;

export const updateOrganizationRoleAction = async (
    { organizationId, roleId, name, hierarchyLevel }: z.infer<typeof updateOrganizationRoleSchema>,
    { db }: { db: AppClient },
) => {
    const user = await db.user.require();

    const result = await new OrganizationRoleEngine(db).updateRole({
        organizationId,
        roleId,
        name,
        hierarchyLevel,
        userId: user.id,
    });

    if (!result.success) {
        throw new Error(result.error || 'Failed to update role');
    }

    revalidatePath('/', 'layout');

    return {
        success: true,
        role: result.role,
    };
};
