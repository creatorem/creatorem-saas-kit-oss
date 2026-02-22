import { getDBClient } from '@kit/shared/server/get-db-client';
import { dashboardRoutes, marketingRoutes } from '@kit/utils/config';
import { applyServerAsyncFilter } from '@kit/utils/filters/server';
import { type Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';
import { Footer } from '~/components/footer';
import { BrandLogo } from '~/components/logo';
import { initServerFilters } from '~/lib/init-server-filters';
import { getMetaTitle } from '~/lib/root-metadata';
import { ClientDashboardPage } from './page-client';

export const metadata: Metadata = {
    title: getMetaTitle('Dashboard'),
};

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: { tour?: string };
}): Promise<React.JSX.Element> {
    const awaitedParams = await searchParams;
    const db = await getDBClient();
    const user = await db.user.require();

    await initServerFilters();
    const shouldRedirect = await applyServerAsyncFilter(
        'server_redirect_root_dashboard',
        dashboardRoutes.paths.dashboard.slug.index.replace('[slug]', user.id),
    );
    if (shouldRedirect) {
        const redirectUrl = awaitedParams.tour === 'true' ? `${shouldRedirect}?tour=true` : shouldRedirect;
        return redirect(redirectUrl);
    }

    return (
        <div className="bg-background relative min-h-screen">
            <div className="bg-background absolute inset-x-0 top-0 z-10 mx-auto flex min-w-72 items-center justify-center p-4">
                <Link href={marketingRoutes.url}>
                    <BrandLogo />
                </Link>
            </div>
            <div className="relative mx-auto flex w-full max-w-xl min-w-72 flex-col items-stretch justify-start gap-6 pt-24 pb-16">
                <ClientDashboardPage />
            </div>
            <Footer />
        </div>
    );
}
