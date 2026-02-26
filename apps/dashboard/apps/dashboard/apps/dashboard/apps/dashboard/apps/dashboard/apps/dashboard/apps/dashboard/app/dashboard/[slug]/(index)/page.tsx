import { getDBClient } from '@kit/shared/server/get-db-client';
import { capitalize } from 'lodash';
import { type Metadata } from 'next';
import React from 'react';
import {
    Dashboard,
    DashboardActions,
    DashboardBody,
    DashboardHeader,
    DashboardPrimaryBar,
} from '~/components/dashboard/dashboard';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/ui/empty';
import { Icon } from '@kit/ui/icon';
import { DashboardActionGroup } from '~/components/dashboard/dashboard-action-group';
import { Search } from '~/components/dashboard/search';
import ErrorBoundary from '~/components/error-boundary';
import { getServerI18n } from '~/lib/i18n.server';
import { getMetaTitle } from '~/lib/root-metadata';
import { DashboardTour } from './dashboard-tour';

export const metadata: Metadata = {
    title: getMetaTitle('Home'),
};

async function HomeLayout({ searchParams }: { searchParams: { tour?: string } }): Promise<React.JSX.Element> {
    const db = await getDBClient();
    const user = await db.user.get();
    const { t } = await getServerI18n();
    const awaitedSearchParams = await searchParams;

    const shouldStartTour = awaitedSearchParams.tour === 'true';

    return (
        <Dashboard>
            <DashboardHeader>
                <DashboardPrimaryBar>
                    {t('welcome.message', {
                        name: capitalize(
                            user?.name
                                ? user.name
                                    .split(' ')
                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')
                                : '',
                        ),
                    })}
                    <DashboardActions>
                        <Search />
                        <DashboardActionGroup />
                    </DashboardActions>
                </DashboardPrimaryBar>
            </DashboardHeader>
            <DashboardBody>
                {/* Order Analytics Section */}
                <ErrorBoundary className="h-full">
                    <div className="h-[calc(100vh-20px-var(--primary-bar-height))] p-2">
                        <Empty className="h-full border rounded-2xl border-dashed">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Icon name="Box" className="size-6" />
                                </EmptyMedia>
                                <EmptyTitle>Build your app here</EmptyTitle>
                            </EmptyHeader>
                        </Empty>
                    </div>
                </ErrorBoundary>
            </DashboardBody>
            {shouldStartTour && <DashboardTour shouldStartTour={shouldStartTour} />}
        </Dashboard>
    );
}

export default HomeLayout;
