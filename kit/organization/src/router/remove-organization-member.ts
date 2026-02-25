import { AppClient } from '@kit/db';
import { ForbiddenError } from '@kit/utils';
import { z } from 'zod';
import { removeMemberSchema as schema } from '../shared/schemas';
import { OrganizationEngine } from '../shared/server';

export const removeOrganizationMemberSchema = schema;

export const removeOrganizationMemberAction = async (
    { memberId, organizationId }: z.infer<typeof removeOrganizationMemberSchema>,
    { db }: { db: AppClient },
) => {
    const user = await db.user.require();

    try {
        await new OrganizationEngine(db).removeMemberWithPermissionCheck(user.id, {
            memberId,
            organizationId,
        });
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to remove member';
        if (message.includes('do not have permission')) {
            throw new ForbiddenError(message);
        }
        throw error;
    }
};
