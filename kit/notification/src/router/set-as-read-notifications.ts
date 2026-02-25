import { AppClient } from '@kit/db';
import { inArray, notification as notificationTable } from '@kit/drizzle';
import { z } from 'zod';

export const setAsReadNotificationsSchema = z.object({
    markAsRead: z
        .object({
            type: z.string().optional(),
            notificationId: z.string(),
        })
        .array(),
});

export const setAsReadNotificationsAction = async (
    { markAsRead }: z.infer<typeof setAsReadNotificationsSchema>,
    { db }: { db: AppClient },
) => {
    const notifications = await db.rls.transaction(async (tx) => {
        return tx
            .update(notificationTable)
            .set({
                read: true,
            })
            .where(
                inArray(
                    notificationTable.id,
                    markAsRead.filter((n) => !n.type || n.type === 'notification').map((n) => n.notificationId),
                ),
            );
    });

    return notifications;
};
