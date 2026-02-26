import type { ExternalStoreThreadData } from '@assistant-ui/react';
import { AppClient } from '@kit/db';
import { aiThread, and, eq, SQL } from '@kit/drizzle';
import { logger } from '@kit/utils';
import { z } from 'zod';

export const selectThreadsSchema = z.object({
    status: z.enum(['regular', 'archived']).optional(),
});

export async function selectThreadsAction({ status }: z.infer<typeof selectThreadsSchema>, { db }: { db: AppClient }) {
    try {
        const user = await db.user.require();

        const threads = await db.rls.transaction(async (tx) => {
            const filters: SQL[] = [eq(aiThread.userId, user.id)];
            if (status) {
                filters.push(eq(aiThread.status, status));
            }

            return await tx
                .select()
                .from(aiThread)
                .where(and(...filters));
        });

        logger.info(
            {
                userId: user.id,
                status,
                count: threads?.length ?? 0,
                action: 'select-threads',
            },
            'Threads fetched successfully',
        );

        return threads.map((thread) => ({
            id: thread.id,
            status: thread.status,
            title: thread.title || undefined,
            metadata: thread.metadata || undefined,
            createdAt: thread.createdAt ? new Date(thread.createdAt).getTime() : undefined,
        })) as ExternalStoreThreadData<'regular' | 'archived'>[];
    } catch (error) {
        logger.error({ error, status, action: 'select-threads' }, 'Failed to select threads');
        throw new Error('Failed to select threads');
    }
}
