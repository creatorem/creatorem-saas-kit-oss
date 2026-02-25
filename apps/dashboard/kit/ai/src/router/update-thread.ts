import { AppClient } from '@kit/db';
import { aiThread, eq } from '@kit/drizzle';
import { logger } from '@kit/utils';
import { z } from 'zod';

export const updateThreadSchema = z.object({
    threadId: z.string().min(1, 'Thread ID is required'),
    title: z.string().optional(),
    status: z.enum(['regular', 'archived']).optional(),
    metadata: z.record(z.unknown()).optional(),
});

export async function updateThreadAction(
    { threadId, title, status, metadata }: z.infer<typeof updateThreadSchema>,
    { db }: { db: AppClient },
) {
    try {
        const user = await db.user.require();

        const updateData: Partial<typeof aiThread.$inferInsert> = {};

        if (title !== undefined) {
            updateData.title = title;
        }

        if (status !== undefined) {
            updateData.status = status;
        }

        if (metadata !== undefined) {
            updateData.metadata = metadata;
        }

        const [updatedThread] = await db.rls.transaction(async (tx) => {
            return await tx.update(aiThread).set(updateData).where(eq(aiThread.id, threadId)).returning();
        });

        if (!updatedThread) {
            logger.warn({ userId: user.id, threadId }, 'Thread not found when updating');
            throw new Error('Thread not found');
        }

        logger.info(
            {
                userId: user.id,
                threadId,
                updateData,
                action: 'update-thread',
            },
            'Thread updated successfully',
        );

        return updatedThread;
    } catch (error) {
        logger.error({ error, threadId, action: 'update-thread' }, 'Failed to update thread');
        throw error;
    }
}
