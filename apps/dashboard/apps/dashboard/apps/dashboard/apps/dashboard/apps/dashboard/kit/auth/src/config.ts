import type { Provider } from '@supabase/supabase-js';
import { z } from 'zod';

/**
 * All the providers that are supported by Supabase.
 * @see https://supabase.com/docs/guides/auth/social-login
 */
const providers: z.ZodType<Provider> = z.enum([
    'apple',
    'azure',
    'bitbucket',
    'discord',
    'facebook',
    'figma',
    'fly',
    'github',
    'gitlab',
    'google',
    'kakao',
    'keycloak',
    'linkedin',
    'linkedin_oidc',
    'notion',
    'slack',
    'spotify',
    'twitch',
    'twitter',
    'workos',
    'zoom',
]);

const schema = z.discriminatedUnion('environment', [
    z.object({
        /**
         * The environment for the auth configuration.
         */
        environment: z.literal('www'),
        /**
         * URL patterns for different scopes of the application.
         */
        scopePatterns: z.object({
            /**
             * Pattern for authentication pages.
             */
            auth: z.string({
                description: 'URL pattern for authentication pages.',
            }),
            /**
             * Pattern for private/protected pages protected by authentication.
             */
            private: z.string({
                description: 'URL pattern for private/protected pages.',
            }),
        }),
        /**
         * If you want to use reCAPTCHA, you need to provide your site key.
         */
        captchaSiteKey: z
            .string({
                description: 'The reCAPTCHA site key.',
            })
            .optional(),
        /**
         * Whether to display the terms checkbox during sign-up.
         */
        displayTermsCheckbox: z
            .boolean({
                description: 'Whether to display the terms checkbox during sign-up.',
            })
            .optional(),
        /**
         * The providers to enable.
         */
        providers: z.object({
            password: z.boolean({
                description: 'Enable password authentication.',
            }),
            oAuth: providers.array(),
        }),
        urls: z.object({
            exit: z.string({
                description: 'Exit url used in the authentication pages.',
            }),
            /**
             * The URL to redirect to after successful authentication.
             */
            dashboard: z.string({
                description: 'The URL to redirect to after successful authentication.',
            }),
            /**
             * The auth callback URL. Used by Supabase to redirect to the home URL after successful authentication.
             */
            callback: z.string({
                description: 'The auth callback URL.',
            }),
            /**
             * The sign-in URL.
             */
            signIn: z.string({
                description: 'The sign-in URL.',
            }),
            /**
             * The sign-up URL.
             */
            signUp: z.string({
                description: 'The sign-up URL.',
            }),
            /**
             * The forgot password URL.
             */
            forgottenPassword: z.string({
                description: 'The forgot password URL.',
            }),
            /**
             * The MFA verification URL.
             */
            verifyMfa: z.string({
                description: 'The MFA verification URL.',
            }),
            termsOfUse: z.string(),
            privacyPolicy: z.string(),
            contactPage: z.string(),
        }),
        /**
         * The password requirements. If you want to enforce password requirements with special characters, numbers, uppercase letters, etc.
         */
        passwordRequirements: z
            .object({
                minLength: z.number({
                    description: 'Minimum password length.',
                }),
                maxLength: z.number({
                    description: 'Maximum password length.',
                }),
                specialChars: z.boolean({
                    description: 'Require special characters in password.',
                }),
                numbers: z.boolean({
                    description: 'Require numbers in password.',
                }),
                uppercase: z.boolean({
                    description: 'Require uppercase letters in password.',
                }),
            })
            .optional(),
        /**
         * 'simple', 'two-column' are available on web only
         */
        // variant: z.enum(['simple', 'two-column'])
        variant: z
            .discriminatedUnion('type', [
                z.object({
                    type: z.literal('simple'),
                }),
                z.object({
                    type: z.literal('two-column'),
                    rightImageUrl: z.string().url(),
                }),
            ])
            .optional(),
    }),
    z.object({
        /**
         * The environment for the auth configuration.
         */
        environment: z.literal('native'),
        /**
         * Whether to display the terms checkbox during sign-up.
         */
        displayTermsCheckbox: z
            .boolean({
                description: 'Whether to display the terms checkbox during sign-up.',
            })
            .optional(),
        /**
         * The providers to enable.
         */
        providers: z.object({
            password: z.boolean({
                description: 'Enable password authentication.',
            }),
            oAuth: providers.array(),
        }),
        urls: z.object({
            exit: z.string({
                description: 'Exit url used in the authentication pages.',
            }),
            /**
             * The URL to redirect to after successful authentication.
             */
            dashboard: z.string({
                description: 'The URL to redirect to after successful authentication.',
            }),
            /**
             * The auth callback URL. Used by Supabase to redirect to the home URL after successful authentication.
             */
            callback: z.string({
                description: 'The auth callback URL.',
            }),
            /**
             * The sign-in URL.
             */
            signIn: z.string({
                description: 'The sign-in URL.',
            }),
            /**
             * The sign-up URL.
             */
            signUp: z.string({
                description: 'The sign-up URL.',
            }),
            /**
             * The forgot password URL.
             */
            forgottenPassword: z.string({
                description: 'The forgot password URL.',
            }),
            /**
             * The MFA verification URL.
             */
            verifyMfa: z.string({
                description: 'The MFA verification URL.',
            }),
            termsOfUse: z.string(),
            privacyPolicy: z.string(),
            contactPage: z.string(),
        }),
        /**
         * The password requirements. If you want to enforce password requirements with special characters, numbers, uppercase letters, etc.
         */
        passwordRequirements: z
            .object({
                minLength: z.number({
                    description: 'Minimum password length.',
                }),
                maxLength: z.number({
                    description: 'Maximum password length.',
                }),
                specialChars: z.boolean({
                    description: 'Require special characters in password.',
                }),
                numbers: z.boolean({
                    description: 'Require numbers in password.',
                }),
                uppercase: z.boolean({
                    description: 'Require uppercase letters in password.',
                }),
            })
            .optional(),
    }),
]);

export type AuthConfig = z.infer<typeof schema>;

export const parseAuthConfig = (config: AuthConfig) => {
    return schema.parse({ ...config }) as AuthConfig;
};
