import { AppClient } from '@kit/db';
import { logger } from '@kit/utils';
import { z } from 'zod';

export const revokeUserSessionSchema = z.object({
    sessionId: z.string().uuid(),
});

export async function revokeUserSessionAction(
    input: z.infer<typeof revokeUserSessionSchema>,
    { db }: { db: AppClient },
) {
    const { sessionId } = input;

    const { data: success, error } = await db.supabase
        .schema('kit')
        .rpc('revoke_user_session', { session_id: sessionId });

    if (error) {
        logger.error({ error, sessionId }, 'Failed to revoke user session');

        if ((error as any).message?.includes('Cannot revoke current session')) {
            throw new Error('Cannot revoke your current session');
        }
        if ((error as any).message?.includes('Session not found')) {
            throw new Error('Session not found or access denied');
        }

        throw new Error('Failed to revoke session');
    }

    if (!success) {
        throw new Error('Session not found or already revoked');
    }

    return { success: true };
}
