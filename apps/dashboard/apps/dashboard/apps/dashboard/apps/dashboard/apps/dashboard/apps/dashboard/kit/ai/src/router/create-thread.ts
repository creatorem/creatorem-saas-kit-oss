import { AppClient } from '@kit/db';
import { aiThread } from '@kit/drizzle';
import { logger } from '@kit/utils';
import { z } from 'zod';

export const createThreadSchema = z.object({
    externalId: z.string().optional(),
    title: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
});

export async function createThreadAction(
    { externalId, title, metadata }: z.infer<typeof createThreadSchema>,
    { db }: { db: AppClient },
) {
    try {
        const user = await db.user.require();

        const [newThread] = await db.rls.transaction(async (tx) => {
            return await tx
                .insert(aiThread)
                .values({
                    userId: user.id,
                    title: title || undefined,
                    status: 'regular',
                    metadata: metadata || {},
                    externalId,
                })
                .returning();
        });

        if (!newThread) {
            logger.warn({ userId: user.id }, 'Failed to create thread');
            throw new Error('Failed to create thread');
        }

        logger.info(
            {
                userId: user.id,
                threadId: newThread.id,
                externalId,
                title,
                action: 'create-thread',
            },
            'Thread created successfully',
        );

        return newThread;
    } catch (error) {
        logger.error({ error, title, action: 'create-thread' }, 'Failed to create thread');
        throw error;
    }
}
