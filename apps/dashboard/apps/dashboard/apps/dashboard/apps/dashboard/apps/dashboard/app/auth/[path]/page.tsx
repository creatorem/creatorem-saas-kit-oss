import { AuthPages, generateAuthMetadata } from '@kit/auth/www/pages/auth-pages';
import { getWithAuthConfig } from '@kit/auth/www/pages/with-auth-config';
import { authConfig } from '~/config/auth.config';
import { getServerI18n } from '~/lib/i18n.server';

export const generateMetadata = getWithAuthConfig({ authConfig, getServerI18n })(generateAuthMetadata);

export default getWithAuthConfig({ authConfig, getServerI18n })(AuthPages);
