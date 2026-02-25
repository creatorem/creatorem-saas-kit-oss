import { AppClient } from '@kit/db';
import { logger } from '@kit/utils';
import { z } from 'zod';

export const revokeAllUserSessionsSchema = z.object({});

export async function revokeAllUserSessionsAction(
    input: z.infer<typeof revokeAllUserSessionsSchema>,
    { db }: { db: AppClient },
) {
    const { data: revokedCount, error } = await db.supabase.schema('kit').rpc('revoke_all_other_sessions');

    if (error) {
        logger.error({ error }, 'Failed to revoke all other sessions');
        throw new Error('Failed to revoke sessions');
    }

    return {
        success: true,
        revokedCount: revokedCount || 0,
        message: `Revoked ${revokedCount || 0} sessions`,
    };
}
