import type { i18n } from 'i18next';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CallbackErrorPage } from './callback-error';
import { ForgottenPasswordPage } from './forgotten-password';
import { SignInPage } from './sign-in';
import { SignUpPage } from './sign-up';
import { VerifyMfaPage } from './verify-mfa';
import { AuthPageProps } from './with-auth-config';

interface AuthPagesProps extends AuthPageProps {
    getServerI18n: () => Promise<i18n>;
    params: Promise<{ path: string }>;
    searchParams: Promise<Record<string, string>>;
}

export const generateAuthMetadata = async ({ params, getServerI18n }: AuthPagesProps): Promise<Metadata> => {
    const awaitedParams = await params;
    const { t } = await getServerI18n();

    switch (awaitedParams.path) {
        case 'sign-in':
            return {
                title: t('p_auth:signInTitle'),
            };
        case 'sign-up':
            return {
                title: t('p_auth:signUpHeading'),
            };
        case 'verify-mfa':
            return {
                title: t('p_auth:signInTitle'),
            };
        case 'forgotten-password':
            return {
                title: t('p_auth:resetPasswordTitle'),
            };
        case 'callback-error':
            return {
                title: 'Authentication error',
            };
    }

    return {};
};

export const AuthPages = async ({ params, ...props }: AuthPagesProps) => {
    const awaitedParams = await params;

    switch (awaitedParams.path) {
        case 'sign-in':
            return <SignInPage {...props} />;
        case 'sign-up':
            return <SignUpPage {...props} />;
        case 'verify-mfa':
            return <VerifyMfaPage {...props} />;
        case 'forgotten-password':
            return <ForgottenPasswordPage {...props} />;
        case 'callback-error':
            // @ts-expect-error
            return <CallbackErrorPage {...props} />;
    }

    notFound();
    return null;
};
