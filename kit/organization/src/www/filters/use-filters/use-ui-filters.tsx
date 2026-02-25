'use client';

import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { organizationRouter } from '../../../router/router';
import { OrganizationList, SidebarOrganizationSwitcher, UserInvitationsPage } from '../../components';
import { OrgConfig } from '../../../config';


/**
 * Enqueue all app events that need useOrganization to work.
*/
export function useUiFilters({ orgConfig }: { orgConfig: OrgConfig }) {
    const DISPLAY_ORGANIZATION_SWITCHER = 'displayOrganizationSwitcher';
    const displayOrganizationSwitcher: FilterCallback<'display_sidebar_logo_name'> = () => (
        <SidebarOrganizationSwitcher orgConfig={orgConfig} />
    );

    const DISPLAY_ORGANIZATION_ROOT_DASHBOARD_PAGE = 'displayOrganizationRootDashboardPage';
    const displayOrganizationRootDashboardPage: FilterCallback<'display_root_dashboard_page'> = (v, { clientTrpc }) => (
        <>
            <OrganizationList orgConfig={orgConfig} clientTrpc={clientTrpc as TrpcClientWithQuery<typeof organizationRouter>} />
            <UserInvitationsPage clientTrpc={clientTrpc as TrpcClientWithQuery<typeof organizationRouter>} />
        </>
    );

    useEnqueueFilter('display_root_dashboard_page', {
        name: DISPLAY_ORGANIZATION_ROOT_DASHBOARD_PAGE,
        fn: displayOrganizationRootDashboardPage,
    });
    useEnqueueFilter('display_sidebar_logo_name', {
        name: DISPLAY_ORGANIZATION_SWITCHER,
        fn: displayOrganizationSwitcher,
    });
}
