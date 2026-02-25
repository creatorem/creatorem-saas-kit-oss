import { AppClient } from '@kit/db';
import { ForbiddenError } from '@kit/utils';
import { z } from 'zod';
import { getOrganizationMembersSchema as schema } from '../shared/schemas';
import { OrganizationEngine } from '../shared/server';

export const getOrganizationMembersSchema = schema;

export const getOrganizationMembersAction = async (
    { organizationId }: z.infer<typeof getOrganizationMembersSchema>,
    { db }: { db: AppClient },
) => {
    const user = await db.user.require();

    try {
        const members = await new OrganizationEngine(db).getMembersWithPermissionCheck(user.id, organizationId);
        return { members };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get organization members';
        if (message.includes('do not have access')) {
            throw new ForbiddenError(message);
        }
        throw error;
    }
};
