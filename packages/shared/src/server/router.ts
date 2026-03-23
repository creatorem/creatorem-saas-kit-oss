import { aiRouter } from '@kit/ai/router';
import { authRouter } from '@kit/auth/router';
import { settingsRouter } from '@kit/settings/router';
import { ctx } from './router.ctx';

export { createRouterContext } from './router.ctx';

export const appRouter = ctx.router({
    ...authRouter,
    ...settingsRouter,
    ...aiRouter,
});
