import type { Viewport } from 'next';
import React from 'react';

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

export default async function RootLayout({ children }: React.PropsWithChildren): Promise<React.JSX.Element> {
    return (
        <html
            data-scroll-behavior="smooth"
            suppressHydrationWarning
        >
            <body>
                {children}
            </body>
        </html>
    );
}
