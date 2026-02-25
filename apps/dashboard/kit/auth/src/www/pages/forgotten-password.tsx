import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@kit/ui/card';
import type { i18n } from 'i18next';
import Link from 'next/link';
import { ForgottenPasswordForm } from '../../www/ui/forgotten-password-form';
import { AuthPageProps } from './with-auth-config';

export const ForgottenPasswordPage: React.FC<AuthPageProps & { getServerI18n: () => Promise<i18n> }> = async ({
    authConfig,
    getServerI18n,
}) => {
    const { t, language } = await getServerI18n();
    const redirectPath = `${authConfig.urls.callback.replace('[lang]', language)}?next=${authConfig.urls.dashboard.replace('[lang]', language)}`;

    return (
        <div className="flex flex-col gap-6">
            <CardHeader>
                <CardTitle className="text-base lg:text-lg">{t('p_auth:resetPasswordTitle')}</CardTitle>
                <CardDescription>{t('p_auth:resetPasswordDescription')}</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
                <ForgottenPasswordForm redirectPath={redirectPath} />
            </CardContent>

            <CardFooter className="flex justify-center text-sm">
                <Link href={authConfig.urls.signIn.replace('[lang]', language)} className="text-foreground underline">
                    {t('p_auth:passwordRecoveredLink')}
                </Link>
            </CardFooter>
        </div>
    );
};
