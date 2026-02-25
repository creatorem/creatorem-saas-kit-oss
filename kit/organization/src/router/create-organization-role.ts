import { AppClient } from '@kit/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createOrganizationRoleSchema as schema } from '../shared/schemas';
import { OrganizationRoleEngine } from '../shared/server/organization-role';

export const createOrganizationRoleSchema = schema;

export const createOrganizationRoleAction = async (
    { organizationId, name, hierarchyLevel }: z.infer<typeof createOrganizationRoleSchema>,
    { db }: { db: AppClient },
) => {
    const user = await db.user.require();

    const result = await new OrganizationRoleEngine(db).createRole({
        organizationId,
        name,
        hierarchyLevel,
        userId: user.id,
    });

    if (!result.success) {
        throw new Error(result.error || 'Failed to create role');
    }

    revalidatePath('/', 'layout');

    return {
        success: true,
        role: result.role,
    };
};
