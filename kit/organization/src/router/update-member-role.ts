import { AppClient } from '@kit/db';
import { ForbiddenError } from '@kit/utils';
import { z } from 'zod';
import { updateMemberRoleSchema as schema } from '../shared/schemas';
import { OrganizationEngine } from '../shared/server';

export const updateMemberRoleSchema = schema;

export const updateMemberRoleAction = async (
    { memberId, roleId, organizationId }: z.infer<typeof updateMemberRoleSchema>,
    { db }: { db: AppClient },
) => {
    const user = await db.user.require();

    try {
        await new OrganizationEngine(db).updateMemberRoleWithPermissionCheck(user.id, {
            memberId,
            roleId,
            organizationId,
        });
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update member role';
        if (message.includes('do not have permission')) {
            throw new ForbiddenError(message);
        }
        throw error;
    }
};
