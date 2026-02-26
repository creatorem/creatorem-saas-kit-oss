import type { Metadata } from 'next';
import React from 'react';
import { getMetaTitle } from '~/lib/root-metadata';

export const metadata: Metadata = {
    title: getMetaTitle('Settings'),
};

export default function SettingsLayout({ children }: React.PropsWithChildren): React.JSX.Element {
    return (
        <div className="flex h-screen flex-row overflow-hidden">
            <div className="size-full">{children}</div>
        </div>
    );
}
