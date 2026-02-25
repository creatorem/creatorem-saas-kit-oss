import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import type { AuthError } from '@supabase/supabase-js';
import type { i18n } from 'i18next';
import Link from 'next/link';
import { ResendAuthLinkForm } from '../../www/ui/resend-auth-link-form';
import { AuthPageProps } from './with-auth-config';

interface AuthCallbackErrorPageProps extends AuthPageProps {
    getServerI18n: () => Promise<i18n>;
    searchParams: Promise<{
        error: string;
        callback?: string;
        email?: string;
        code?: AuthError['code'];
    }>;
}

export const CallbackErrorPage = async ({ authConfig, getServerI18n, ...props }: AuthCallbackErrorPageProps) => {
    const { t, language } = await getServerI18n();
    const { error, callback, code } = await props.searchParams;
    const signInPath = authConfig.urls.signIn.replace('[lang]', language);
    const redirectPath = callback ?? authConfig.urls.callback.replace('[lang]', language);

    return (
        <div className={'flex flex-col space-y-4 py-4'}>
            <Alert variant={'warning'}>
                <AlertTitle>{t('p_auth:authenticationErrorAlertHeading')}</AlertTitle>

                <AlertDescription>{error || t('p_auth:authenticationErrorAlertBody')}</AlertDescription>
            </Alert>

            <AuthCallbackForm code={code} signInPath={signInPath} redirectPath={redirectPath} t={t} />
        </div>
    );
};

function AuthCallbackForm(props: {
    signInPath: string;
    redirectPath?: string;
    code?: AuthError['code'];
    t: i18n['t'];
}) {
    switch (props.code) {
        case 'otp_expired':
            return <ResendAuthLinkForm redirectPath={props.redirectPath} />;
        default:
            return (
                <Button className={'w-full'} asChild aria-label={props.t('p_auth:signInButton')}>
                    <Link href={props.signInPath}>{props.t('p_auth:signInButton')}</Link>
                </Button>
            );
    }
}
