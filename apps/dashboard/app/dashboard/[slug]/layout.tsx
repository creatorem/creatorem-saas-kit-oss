import type { Metadata } from 'next';
import React from 'react';
import { getMetaTitle } from '~/lib/root-metadata';
import { LayoutClient } from './layout-client';

export const metadata: Metadata = {
    title: getMetaTitle('Dashboard'),
};

export default async function DashboardLayout({ children }: React.PropsWithChildren): Promise<React.JSX.Element> {
    return <LayoutClient>{children}</LayoutClient>;
}
