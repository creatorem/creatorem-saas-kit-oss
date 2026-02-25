import { AppClient } from '@kit/db';
import { and, eq, notification as notificationTable } from '@kit/drizzle';
import { applyServerAsyncFilter } from '@kit/utils/filters/server';

export const hasUnreadNotificationsAction = async ({ db }: { db: AppClient }) => {
    const currentUser = await db.user.require();

    const selectUnreadNotifWhereCondition = await applyServerAsyncFilter(
        'server_notification_select_unread_notif_where_condition',
        and(eq(notificationTable.userId, currentUser.id), eq(notificationTable.read, false)),
    );

    const unreadNotifications = await db.rls.transaction(async (tx) => {
        return tx
            .select({ id: notificationTable.id })
            .from(notificationTable)
            .where(selectUnreadNotifWhereCondition)
            .limit(1);
    });

    return {
        hasUnread: unreadNotifications.length > 0,
    };
};
