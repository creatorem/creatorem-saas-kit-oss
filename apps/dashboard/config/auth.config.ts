import { parseAuthConfig } from '@kit/auth/config';
import { dashboardRoutes, marketingRoutes } from '@kit/utils/config';
import { envs } from '~/envs';

export const authConfig = parseAuthConfig({
    environment: 'www',
    scopePatterns: {
        auth: '/auth/*?',
        private: '/(dashboard)/*?',
    },
    urls: {
        exit: marketingRoutes.url,
        dashboard: dashboardRoutes.paths.dashboard.index,
        callback: dashboardRoutes.paths.auth.callback,
        signIn: dashboardRoutes.paths.auth.signIn,
        signUp: dashboardRoutes.paths.auth.signUp,
        forgottenPassword: dashboardRoutes.paths.auth.forgottenPassword,
        verifyMfa: dashboardRoutes.paths.auth.verifyMfa,
        contactPage: marketingRoutes.url + marketingRoutes.paths.lang.contact,
        privacyPolicy: marketingRoutes.url + marketingRoutes.paths.lang.privacyPolicy,
        termsOfUse: marketingRoutes.url + marketingRoutes.paths.lang.termsOfUse,
    },
    // NB: This is a public key, so it's safe to expose.
    // Copy the value from the Supabase Dashboard.
    captchaSiteKey: envs().NEXT_PUBLIC_CAPTCHA_SITE_KEY,

    // whether to display the terms checkbox during sign-up
    displayTermsCheckbox: true,

    // NB: Enable the providers below in the Supabase Console
    // in your production project
    providers: {
        password: true,
        oAuth: ['google'],
    },
    passwordRequirements: {
        minLength: 3,
        maxLength: 99,
        specialChars: false,
        numbers: false,
        uppercase: false,
    },
    variant: {
        type: 'two-column',
        rightImageUrl: 'https://ui.shadcn.com/placeholder.svg',
    },
});
