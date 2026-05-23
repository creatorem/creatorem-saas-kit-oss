import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import type { AuthError } from '@supabase/supabase-js';
import type { i18n } from 'i18next';
import { AuthCallbackErrorActions } from '../../www/ui/auth-callback-error-actions';
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
    const errorMessage = error ? t(error, { defaultValue: error }) : t('p_auth:authenticationErrorAlertBody');

    return (
        <div className={'flex flex-col space-y-4 py-4'}>
            <Alert variant={'warning'}>
                <AlertTitle>{t('p_auth:authenticationErrorAlertHeading')}</AlertTitle>

                <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>

            <AuthCallbackErrorActions
                signInPath={signInPath}
                redirectPath={redirectPath}
                signInLabel={t('p_auth:signInButton')}
                code={code}
            />
        </div>
    );
};
