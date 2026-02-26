'use client';

// import { useLangUrl } from '@kit/i18n/hooks/use-lang-url';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { isBrowser } from '@kit/utils';
import { applyFilter, useApplyFilter } from '@kit/utils/filters';
import type { Provider } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import type { AuthConfig } from '../../config';
import { OauthForm } from './components/oauth-form';
import { PasswordSignUpForm } from './components/sign-up/password-sign-up-form';

interface SignUpMethodsHubProps {
    providers: {
        password: boolean;
        oAuth: Provider[];
    };
    inviteToken?: string;
    authConfig: AuthConfig;
}

export const SignUpMethodsHub: React.FC<SignUpMethodsHubProps> = ({ providers, inviteToken, authConfig }) => {
    const { t } = useTranslation('p_auth');
    const url = useApplyFilter('get_url_updater', (u) => u);

    const redirectUrl = applyFilter('auth_on_sign_up_redirect_url', getCallbackUrl(url(authConfig.urls.callback)));
    const defaultValues = getDefaultValues();

    return (
        <div className="flex flex-col gap-4">
            {inviteToken && <InviteAlert />}
            {providers.password && (
                <PasswordSignUpForm
                    authConfig={authConfig}
                    emailRedirectTo={redirectUrl}
                    defaultValues={defaultValues}
                />
            )}

            {providers.oAuth.length > 0 && (
                <>
                    {providers.password ? (
                        <div className="flex items-center gap-2">
                            <div className="border-b flex-1"></div>
                            <span className="text-muted-foreground px-2 text-sm whitespace-nowrap">
                                {t('orContinueWith')}
                            </span>
                            <div className="border-b flex-1"></div>
                        </div>
                    ) : null}

                    <OauthForm createUser={true} authConfig={authConfig} />
                </>
            )}
        </div>
    );
};

const getCallbackUrl = (redirectPath: string) => {
    if (!isBrowser()) {
        return '';
    }

    const origin = window.location.origin;
    const url = new URL(redirectPath, origin);

    const searchParams = new URLSearchParams(window.location.search);
    const next = searchParams.get('next');

    if (next) {
        url.searchParams.set('next', next);
    }

    return url.href;
};

const getDefaultValues = () => {
    if (!isBrowser()) {
        return { email: '' };
    }

    const searchParams = new URLSearchParams(window.location.search);
    const inviteToken = searchParams.get('invite_token');

    if (!inviteToken) {
        return { email: '' };
    }

    return {
        email: searchParams.get('email') ?? '',
    };
};

const InviteAlert: React.FC = () => {
    const { t } = useTranslation('p_auth');
    return (
        <Alert variant={'info'}>
            <AlertTitle>{t('inviteAlertHeading')}</AlertTitle>

            <AlertDescription>{t('inviteAlertDescription')}</AlertDescription>
        </Alert>
    );
};
