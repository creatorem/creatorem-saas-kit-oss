import { dashboardRoutes } from '@kit/utils/config';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { appConfig } from '~/config/app.config';
import { getServerI18n } from './i18n.server';

export function getMetaTitle(title: string, addSuffix: boolean = true): string {
    if (!addSuffix) {
        return title;
    }

    if (!title) {
        return appConfig.name;
    }

    return `${title} | ${appConfig.name}`;
}

/**
 * @name generateRootMetadata
 * @description Generates the root metadata for the application
 */
export const generateRootMetadata = async (): Promise<Metadata> => {
    const headersStore = await headers();
    const csrfToken = headersStore.get('x-csrf-token') ?? '';
    const { language } = await getServerI18n();

    return {
        title: {
            default: appConfig.name,
            template: `%s | ${appConfig.name}`,
        },
        metadataBase: new URL(dashboardRoutes.url),
        applicationName: appConfig.name,
        description: appConfig.description,
        keywords: ['Next.js', 'React', 'Expo', 'Mobile', 'Application'],
        creator: 'Your Name',
        authors: [
            {
                name: 'Your Name',
                url: 'https://your-website.com',
            },
        ],
        openGraph: {
            type: 'website',
            locale: language,
            siteName: appConfig.name,
            title: appConfig.title,
            description: appConfig.description,
            url: dashboardRoutes.url,
            images: {
                url: `${dashboardRoutes.url}/og`,
                width: 1200,
                height: 630,
                alt: appConfig.name,
            },
        },
        twitter: {
            card: 'summary_large_image',
            title: appConfig.title,
            description: appConfig.description,
            images: [`${dashboardRoutes.url}/og`],
            creator: 'Your Name',
        },
        icons: {
            icon: '/images/favicon.ico',
            shortcut: '/images/pwa-logo/manifest-icon-192.maskable.png',
            apple: '/images/pwa-logo/apple-icon-180.png',
        },
        robots: {
            index: true,
            follow: true,
        },
        other: {
            'csrf-token': csrfToken,
        },
    };
};
