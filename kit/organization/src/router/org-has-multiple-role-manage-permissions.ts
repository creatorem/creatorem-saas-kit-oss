import { AppClient } from '@kit/db';
import { z } from 'zod';

export const orgHasMultipleRoleManagePermissionsSchema = z.object({
    organizationId: z.string(),
});

export const orgHasMultipleRoleManagePermissionsAction = async (
    { organizationId }: z.infer<typeof orgHasMultipleRoleManagePermissionsSchema>,
    { db }: { db: AppClient },
) => {
    const { data: hasMultiple } = await db.supabase.schema('kit').rpc('has_multiple_role_manage_permissions', {
        org_id: organizationId,
    });

    return { hasMultiple };
};
