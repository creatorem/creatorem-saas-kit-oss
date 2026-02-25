import { AppClient } from '@kit/db';
import { and, count, desc, eq, notification as notificationTable } from '@kit/drizzle';
import { applyServerAsyncFilter } from '@kit/utils/filters/server';
import { z } from 'zod';

export const getNotificationsSchema = z.object({
    page: z.coerce.number(),
    pageSize: z.coerce.number(),
});

export const getNotificationsAction = async (
    { page, pageSize }: z.infer<typeof getNotificationsSchema>,
    { db }: { db: AppClient },
) => {
    const offset = (page - 1) * pageSize;
    const currentUser = await db.user.require();

    const whereCondition = await applyServerAsyncFilter(
        'server_notification_select_all_notifs_where_condition',
        and(eq(notificationTable.userId, currentUser.id)),
    );

    const [notifications, totalNtfsCount] = await db.rls.transaction(async (tx) => {
        const ntfs = await tx
            .select()
            .from(notificationTable)
            .where(whereCondition)
            .limit(pageSize)
            .offset(offset)
            .orderBy(desc(notificationTable.createdAt));

        const totalNtfsCount = await tx.select({ count: count() }).from(notificationTable);

        return [ntfs, totalNtfsCount];
    });

    const totalCount = totalNtfsCount[0]?.count || 0;

    return {
        notifications,
        totalCount,
    };
};
