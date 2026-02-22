import { type MetadataRoute } from 'next';
import { appConfig } from '~/config/app.config';

export default function Manifest(): MetadataRoute.Manifest {
    return {
        name: appConfig.name,
        short_name: appConfig.name,
        description: appConfig.description,
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/images/pwa-logo/manifest-icon-192.maskable.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/images/pwa-logo/manifest-icon-192.maskable.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/images/pwa-logo/manifest-icon-512.maskable.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/images/pwa-logo/manifest-icon-512.maskable.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    };
}
