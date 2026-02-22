import { authRouter } from '@kit/auth/router';
import { getSettingsRouter } from '@kit/settings/router';
import { settingsSchemas } from '../config/settings.schema.config';
import { clientRouter } from './router.client';
import { ctx } from './router.ctx';
import { orderRouter } from './router.order';
import { productRouter } from './router.product';

export { createRouterContext } from './router.ctx';

export const appRouter = ctx.router({
    ...orderRouter,
    ...clientRouter,
    ...productRouter,
    ...authRouter,
    ...getSettingsRouter(settingsSchemas)
});
