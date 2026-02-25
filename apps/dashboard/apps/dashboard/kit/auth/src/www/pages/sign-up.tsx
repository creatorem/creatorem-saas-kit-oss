import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@kit/ui/card';
import type { i18n } from 'i18next';
import Link from 'next/link';
import { SignUpMethodsHub } from '../../www/ui/sign-up-hub';
import { AuthPageProps } from './with-auth-config';

interface SignUpPageProps extends AuthPageProps {
    getServerI18n: () => Promise<i18n>;
    searchParams: Promise<{
        invite_token?: string;
    }>;
}

export const SignUpPage = async ({ authConfig, getServerI18n, searchParams }: SignUpPageProps) => {
    const { t, language } = await getServerI18n();
    const params = await searchParams;

    const baseSignUpPath = authConfig.urls.signIn.replace('[lang]', language);
    const searchParamsString = new URLSearchParams(
        Object.entries(params).filter(([_, value]) => value !== undefined) as [string, string][],
    ).toString();
    const signInPath = baseSignUpPath + (searchParamsString ? `?${searchParamsString}` : '');

    return (
        <>
            <div className="flex flex-col gap-6">
                <CardHeader>
                    <CardTitle className="text-base lg:text-lg">{t('p_auth:signUpHeading')}</CardTitle>
                    <CardDescription>{t('p_auth:signUpDescription')}</CardDescription>
                </CardHeader>

                <CardContent>
                    <SignUpMethodsHub providers={authConfig.providers} authConfig={authConfig} />
                </CardContent>

                <CardFooter className="text-muted-foreground flex justify-center gap-1 text-sm">
                    <span>{t('p_auth:alreadyHaveAnAccount')}</span>
                    <Link href={signInPath} className="text-foreground underline">
                        {t('p_auth:signIn')}
                    </Link>
                </CardFooter>
            </div>
            <div className="text-muted-foreground px-4 mt-6 text-center text-xs lg:absolute bottom-6 inset-x-0">
                {t('p_auth:bySigningUp')}{' '}
                <Link
                    prefetch={false}
                    href={authConfig.urls.termsOfUse.replace('[lang]', language)}
                    className="text-foreground underline"
                >
                    {t('p_auth:termsOfService')}
                </Link>{' '}
                {t('p_auth:and')}{' '}
                <Link
                    prefetch={false}
                    href={authConfig.urls.privacyPolicy.replace('[lang]', language)}
                    className="text-foreground underline"
                >
                    {t('p_auth:privacyPolicy')}
                </Link>
                . {t('p_auth:needHelp')}{' '}
                <Link
                    prefetch={false}
                    href={authConfig.urls.contactPage.replace('[lang]', language)}
                    className="text-foreground underline"
                >
                    {t('p_auth:getInTouch')}
                </Link>
                .
            </div>
        </>
    );
};
