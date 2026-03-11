import { aiRouter } from '@kit/ai/router';
import { authRouter } from '@kit/auth/router';
import { getSettingsRouter } from '@kit/settings/router';
import { settingsSchemas } from '../config/settings.schema.config';
import { ctx } from './router.ctx';

export { createRouterContext } from './router.ctx';

export const appRouter = ctx.router({
    ...authRouter,
    ...getSettingsRouter(settingsSchemas),
    ...aiRouter,
});
