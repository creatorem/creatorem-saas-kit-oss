import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@kit/ui/card';
import type { i18n } from 'i18next';
import Link from 'next/link';
import { SignInHub } from '../../www/ui/sign-in-hub';
import { AuthPageProps } from './with-auth-config';

interface SignInPageProps extends AuthPageProps {
    getServerI18n: () => Promise<i18n>;
    searchParams: Promise<Record<string, string>>;
}

export const SignInPage = async ({ authConfig, getServerI18n, searchParams }: SignInPageProps) => {
    const { t, language } = await getServerI18n();
    const params = await searchParams;

    const baseSignUpPath = authConfig.urls.signUp.replace('[lang]', language);
    const searchParamsString = new URLSearchParams(
        Object.entries(params).filter(([_, value]) => value !== undefined) as [string, string][],
    ).toString();
    const signUpPath = baseSignUpPath + (searchParamsString ? `?${searchParamsString}` : '');

    return (
        <div className="flex flex-col gap-6">
            <CardHeader>
                <CardTitle className="text-base lg:text-lg">{t('p_auth:signInTitle')}</CardTitle>
                <CardDescription>{t('p_auth:signInDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <SignInHub authConfig={authConfig} />
            </CardContent>
            <CardFooter className="text-muted-foreground flex justify-center gap-1 text-sm">
                <span>{t('p_auth:dontHaveAccount')}</span>
                <Link href={signUpPath} prefetch={true} className="text-foreground underline">
                    {t('p_auth:signUp')}
                </Link>
            </CardFooter>
        </div>
    );
};
