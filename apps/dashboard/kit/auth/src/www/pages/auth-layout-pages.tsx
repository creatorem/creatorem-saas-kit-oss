import { CaptchaProvider } from '@kit/auth/www/captcha/client';
import { AuthLayout as SimpleAuthLayout } from './simple/auth-layout';
import { AuthLayout as TwoColumnAuthLayout } from './two-column/auth-layout';
import { AuthPageProps } from './with-auth-config';

type AuthLayoutPagesProps = React.PropsWithChildren &
    Omit<AuthPageProps, 'getServerI18n'> & {
        Logo: React.ComponentType;
    };

export async function AuthLayoutPages({ children, authConfig, Logo }: AuthLayoutPagesProps) {
    if (authConfig.environment !== 'www') {
        throw new Error('You must use the www environement value in your config object.');
    }
    const AuthLayout = authConfig.variant?.type === 'two-column' ? TwoColumnAuthLayout : SimpleAuthLayout;

    if (authConfig.environment === 'www' && authConfig.captchaSiteKey) {
        return (
            <CaptchaProvider siteKey={authConfig.captchaSiteKey}>
                <AuthLayout authConfig={authConfig} Logo={Logo}>
                    {children}
                </AuthLayout>
            </CaptchaProvider>
        );
    }

    return (
        <AuthLayout authConfig={authConfig} Logo={Logo}>
            {children}
        </AuthLayout>
    );
}
