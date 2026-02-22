import { createCallbackRoute } from '@kit/auth/www/routes/callback';
import { authConfig } from '~/config/auth.config';
import { getServerI18n } from '~/lib/i18n.server';
import { initServerFilters } from '~/lib/init-server-filters';

initServerFilters();

export const GET = createCallbackRoute(authConfig, getServerI18n);
