import { AppClient } from '@kit/db';
import { z } from 'zod';
import { OrganizationDBClient } from '../shared/server';

export const getOrganizationRolesSchema = z.object({
    organizationId: z.string(),
});

export const getOrganizationRolesAction = async (
    { organizationId }: z.infer<typeof getOrganizationRolesSchema>,
    { db }: { db: AppClient },
) => {
    const organizationClient = new OrganizationDBClient(db);
    return await organizationClient.getOrganizationRoles(organizationId);
};
