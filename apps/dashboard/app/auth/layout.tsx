import { AuthLayoutPages } from '@kit/auth/www/pages/auth-layout-pages';
import { getWithAuthConfig } from '@kit/auth/www/pages/with-auth-config';
import { BrandLogo } from '~/components/logo';
import { authConfig } from '~/config/auth.config';

export default getWithAuthConfig({ authConfig, Logo: BrandLogo })(AuthLayoutPages);
