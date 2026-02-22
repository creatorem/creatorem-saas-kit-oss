import { UserProvider } from '@kit/auth/shared/user';
import { dashboardRoutes } from '@kit/utils/config';
import { type Metadata } from 'next';
import { redirect } from 'next/navigation';
import React from 'react';
import { getMetaTitle } from '~/lib/root-metadata';
import { serverTrpc } from '~/trpc/server-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: getMetaTitle('Dashboard'),
};

export default async function DashboardLayout(props: React.PropsWithChildren): Promise<React.JSX.Element> {
    const user = await serverTrpc.getUser.fetch();

    if (!user) {
        return redirect(dashboardRoutes.paths.auth.signIn);
    }
    return <UserProvider user={user}>{props.children}</UserProvider>;
}
