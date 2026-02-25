import { aiRouter } from '@kit/ai/router';
import { authRouter } from '@kit/auth/router';
import { billingRouter } from '@kit/billing/router';
import { contentTypeRouter } from '@kit/content-type/router';
import { getKeybindingsRouter } from '@kit/keybindings/router';
import { notificationRouter } from '@kit/notification/router';
import { organizationRouter } from '@kit/organization/router';
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
    ...notificationRouter,
    ...getSettingsRouter(settingsSchemas),
    ...getKeybindingsRouter(settingsSchemas),
    ...organizationRouter,
    ...billingRouter,
    ...contentTypeRouter,
    ...aiRouter,
});
