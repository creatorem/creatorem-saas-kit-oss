import { AuthScreens } from '@kit/auth/native/screens/auth-screens';
import { getWithAuthConfig } from '@kit/auth/native/screens/with-auth-config';
import { authConfig } from '~/config/auth.config';

export default getWithAuthConfig({ authConfig })(AuthScreens);
