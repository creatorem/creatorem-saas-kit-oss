import { envs } from '../../envs';

const urls = {
    marketing: {
        url: envs().NEXT_PUBLIC_MARKETING_URL,
        paths: {
            lang: {
                cookiePolicy: `[lang]/cookie-policy`,
                privacyPolicy: `[lang]/privacy-policy`,
                termsOfUse: `[lang]/terms-of-use`,
                blog: {
                    index: `[lang]/blog`,
                    post: `[lang]/blog/[slug]`,
                    postLLM: `[lang]/blog/[slug]/llm.md`,
                },
                contact: `[lang]/contact`,
                pricing: `[lang]/pricing`,
                roadmap: '[lang]/roadmap',
            },
            api: {
                index: `/api`,
                health: `/api/health`,
            },
            og: `/og`,
            docs: `/docs`,
            sitemap: '/sitemap.xml',
            version: `/version`,
            'llms.mdx': `/llms.mdx`,
            'llms-full.txt': `/llms-full.txt`,
            'llms.txt': `/llms.txt`,
        },
    },
    dashboard: {
        url: envs().NEXT_PUBLIC_DASHBOARD_URL,
        paths: {
            api: {
                index: `/api`,
                billing: { webhook: '/api/billing/webhook' },
                health: `/api/health`,
            },
            og: `/og`,
            auth: {
                index: `/auth`,
                callback: '/auth/callback',
                signIn: `/auth/sign-in`,
                signUp: `/auth/sign-up`,
                forgottenPassword: '/auth/forgotten-password',
                verifyMfa: '/auth/verify-mfa',
            },
            invitations: '/invitations',
            onboarding: {
                index: `/onboarding`,
                organization: `/onboarding/organization`,
                user: `/onboarding/user`,
            },
            dashboard: {
                index: `/dashboard`,
                slug: {
                    index: `/dashboard/[slug]`,
                    orders: {
                        index: `/dashboard/[slug]/orders`,
                        id: `/dashboard/[slug]/orders/[id]`,
                        new: `/dashboard/[slug]/orders/new`,
                    },
                    products: {
                        index: `/dashboard/[slug]/products`,
                        id: `/dashboard/[slug]/products/[id]`,
                        new: `/dashboard/[slug]/products/new`,
                    },
                    clients: {
                        index: `/dashboard/[slug]/clients`,
                        id: `/dashboard/[slug]/clients/[id]`,
                        new: `/dashboard/[slug]/clients/new`,
                    },
                    billing: {
                        index: `/dashboard/[slug]/billing`,
                    },
                    settings: {
                        index: `/dashboard/[slug]/settings`,
                        // profile is the same as index
                        profile: `/dashboard/[slug]/settings`,
                        security: `/dashboard/[slug]/settings/security`,
                        keybindings: `/dashboard/[slug]/settings/keybindings`,
                        invitations: `/dashboard/[slug]/settings/invitations`,
                        // not implemented yet
                        // notifications: `/dashboard/[slug]/settings/notifications`,
                        organization: {
                            index: `/dashboard/[slug]/settings/organization`,
                            members: `/dashboard/[slug]/settings/organization/members`,
                            roles: `/dashboard/[slug]/settings/organization/roles`,
                            billing: `/dashboard/[slug]/settings/organization/billing`,
                        },
                    },
                    aiChat: `/dashboard/[slug]/ai-chat`,
                },
            },
        },
    },
} as const;

export const dashboardRoutes = urls.dashboard;
export const marketingRoutes = urls.marketing;

// type ExtractSlugRoutes<T> =
//     T extends Record<string, unknown>
//     ? {
//         [K in keyof T]: T[K] extends string
//         ? T[K] extends `${string}[slug]${string}`
//         ? T[K]
//         : never
//         : ExtractSlugRoutes<T[K]>;
//     }[keyof T]
//     : never;

// type DashboardSlugRoutes = ExtractSlugRoutes<typeof dashboardRoutes.paths.dashboard.slug>;

export function replaceOrgSlug(route: string, slug: string): string {
    // if (route.indexOf('[slug]') === -1) {
    //     throw new Error(`Invalid route: ${route}. Route must contain the placeholder [slug].`);
    // }

    if (typeof route !== 'string') {
        console.warn({ route });
        throw new Error('route is not a string');
    }

    return route.replace('[slug]', slug);
}

export function getPathname(route: string, baseUrl: string): string {
    return new URL(route, baseUrl).pathname;
}
