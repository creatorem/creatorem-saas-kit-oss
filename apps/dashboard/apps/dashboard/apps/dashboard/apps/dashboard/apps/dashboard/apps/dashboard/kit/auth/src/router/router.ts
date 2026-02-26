import { CtxRouter } from '@creatorem/next-trpc';
import { AppClient } from '@kit/db';
import { deleteUserAction } from './delete-user';
import { updateUserAction, updateUserSchema } from './update-user';
import { debugUserSessionAction, debugUserSessionSchema } from './user-sessions/debug-user-session';
import { geolocalizeUserSessionAction, geolocalizeUserSessionSchema } from './user-sessions/geolocalize-user-session';
import { getUserSessionsAction, getUserSessionsSchema } from './user-sessions/get-user-sessions';
import { revokeAllUserSessionsAction, revokeAllUserSessionsSchema } from './user-sessions/revoke-all-user-sessions';
import { revokeUserSessionAction, revokeUserSessionSchema } from './user-sessions/revoke-user-session';

const ctx = new CtxRouter<{ db: AppClient }>();

export const authRouter = ctx.router({
    getUser: ctx.endpoint.action(async ({ db }) => {
        return await db.user.get();
    }),
    updateUser: ctx.endpoint.input(updateUserSchema).action(updateUserAction),
    deleteUser: ctx.endpoint.action(deleteUserAction),

    // User Sessions
    getUserSessions: ctx.endpoint.input(getUserSessionsSchema).action(getUserSessionsAction),
    revokeUserSession: ctx.endpoint.input(revokeUserSessionSchema).action(revokeUserSessionAction),
    revokeAllUserSessions: ctx.endpoint.input(revokeAllUserSessionsSchema).action(revokeAllUserSessionsAction),
    geolocalizeUserSession: ctx.endpoint.input(geolocalizeUserSessionSchema).action(geolocalizeUserSessionAction),
    debugUserSession: ctx.endpoint.input(debugUserSessionSchema).action(debugUserSessionAction),
});
