import { AppClient } from '@kit/db';
import { aiThread, eq } from '@kit/drizzle';
import { logger } from '@kit/utils';
import { z } from 'zod';

export const deleteThreadSchema = z.object({
    threadId: z.string().min(1, 'Thread ID is required'),
});

export async function deleteThreadAction({ threadId }: z.infer<typeof deleteThreadSchema>, { db }: { db: AppClient }) {
    try {
        const user = await db.user.require();

        const result = await db.rls.transaction(async (tx) => {
            return await tx.delete(aiThread).where(eq(aiThread.id, threadId));
        });

        logger.info(
            {
                userId: user.id,
                threadId,
                action: 'delete-thread',
            },
            'Thread deleted successfully',
        );

        return { success: true, deletedCount: result };
    } catch (error) {
        logger.error({ error, threadId, action: 'delete-thread' }, 'Failed to delete thread');
        throw error;
    }
}
