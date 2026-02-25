import { CtxRouter } from '@creatorem/next-trpc';
import { AppClient } from '@kit/db';
import { getNotificationsAction, getNotificationsSchema } from './get-notifications';
import { hasUnreadNotificationsAction } from './has-unread-notifications';
import { setAsReadNotificationsAction, setAsReadNotificationsSchema } from './set-as-read-notifications';

const ctx = new CtxRouter<{ db: AppClient }>();

export const notificationRouter = ctx.router({
    getNotifications: ctx.endpoint.input(getNotificationsSchema).action(getNotificationsAction),
    setAsReadNotifications: ctx.endpoint.input(setAsReadNotificationsSchema).action(setAsReadNotificationsAction),
    hasUnreadNotifications: ctx.endpoint.action(hasUnreadNotificationsAction),
});
