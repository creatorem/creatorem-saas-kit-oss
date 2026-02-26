import { Toaster } from '@kit/ui/sonner';
import { cn } from '@kit/utils';
import type { Viewport } from 'next';
import React from 'react';
import { fontVariables } from '~/lib/fonts';
import { getServerI18n } from '~/lib/i18n.server';
import { generateRootMetadata } from '~/lib/root-metadata';
import { getRootTheme } from '~/lib/root-theme';
import { AppProvider } from '../components/providers/app-provider';

import './globals.css';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 1,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: 'white' },
        { media: '(prefers-color-scheme: dark)', color: 'black' },
    ],
};

export const generateMetadata = async () => {
    return await generateRootMetadata();
};

export default async function RootLayout({ children }: React.PropsWithChildren): Promise<React.JSX.Element> {
    const { language } = await getServerI18n();
    const theme = await getRootTheme();

    return (
        <html
            lang={language}
            data-scroll-behavior="smooth"
            className={cn('bg-background', {
                dark: theme === 'dark',
                light: theme === 'light',
            })}
            suppressHydrationWarning
        >
            <body
                className={cn(
                    'bg-sidebar text-foreground group/body relative z-10 size-full min-h-svh overscroll-none font-sans antialiased',
                    fontVariables,
                )}
            >
                <AppProvider lang={language}>
                    {children}
                    <React.Suspense>
                        <Toaster />
                    </React.Suspense>
                </AppProvider>
            </body>
        </html>
    );
}
