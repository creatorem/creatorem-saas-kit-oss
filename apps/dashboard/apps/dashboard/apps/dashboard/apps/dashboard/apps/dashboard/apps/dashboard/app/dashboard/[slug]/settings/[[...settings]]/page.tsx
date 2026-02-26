'use server';

import { SettingSaveButtonAnchor } from '@kit/settings/www/ui';
import { type Metadata } from 'next';
import React from 'react';
import {
    Dashboard,
    DashboardActions,
    DashboardBody,
    DashboardHeader,
    DashboardPrimaryBar,
} from '~/components/dashboard/dashboard';
import { DashboardActionGroup } from '~/components/dashboard/dashboard-action-group';
import { DashboardBreadcrumb } from '~/components/dashboard/dashboard-breadcrumb';
import { getServerI18n } from '~/lib/i18n.server';
import { getMetaTitle } from '~/lib/root-metadata';
import { ClientSettingsPage } from './page-client';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: getMetaTitle('Settings'),
    };
}

async function SettingsPage({
    params,
}: {
    params: {
        settings: string[];
    };
}): Promise<React.JSX.Element> {
    const awaitedParams = await params;
    const { t } = await getServerI18n();

    return (
        <Dashboard>
            <DashboardHeader>
                <DashboardPrimaryBar>
                    <DashboardBreadcrumb info={t('dashboard:settings.manageAccountSettings')} />
                    <DashboardActions>
                        <SettingSaveButtonAnchor />
                        <DashboardActionGroup />
                    </DashboardActions>
                </DashboardPrimaryBar>
            </DashboardHeader>
            <DashboardBody>
                <ClientSettingsPage awaitedParams={awaitedParams} />
            </DashboardBody>
        </Dashboard>
    );
}

export default SettingsPage;
