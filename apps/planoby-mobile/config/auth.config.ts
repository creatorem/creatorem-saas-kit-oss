import { parseAuthConfig } from '@kit/auth/config';
import { envs } from '~/envs';

const urls = {
    exit: '/', // use Href for native env
    dashboard: '/', // use Href for native env
    callback: '/auth/callback',
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    forgottenPassword: '/auth/forgotten-password',
    verifyMfa: '/auth/verify',
    contactPage: `${envs().EXPO_PUBLIC_MARKETING_URL}/en/contact`,
    privacyPolicy: `${envs().EXPO_PUBLIC_MARKETING_URL}/en/privacy-policy`,
    termsOfUse: `${envs().EXPO_PUBLIC_MARKETING_URL}/en/terms-of-use`,
} satisfies Record<string, string>;

export const authConfig = parseAuthConfig({
    environment: 'native',
    urls,
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
});
