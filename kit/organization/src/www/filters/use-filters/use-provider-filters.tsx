'use client';

import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { organizationRouter } from '../../../router/router';
import { WebOrganizationProvider } from '../../components';

/**
 * Enqueue all app events that need useOrganization to work.
 */
export function useProviderFilters() {
    const RENDER_ORGANIZATION_PROVIDER = 'renderOrganizationProvider';
    const renderOrganizationProvider: FilterCallback<'display_trpc_provider_wrapper_in_dashboard'> = (
        children,
        { clientTrpc, loader, slug },
    ) => {
        return (
            <WebOrganizationProvider
                loader={loader}
                slug={slug}
                clientTrpc={clientTrpc as TrpcClientWithQuery<typeof organizationRouter>}
            >
                {children}
            </WebOrganizationProvider>
        );
    };

    useEnqueueFilter('display_trpc_provider_wrapper_in_dashboard', {
        name: RENDER_ORGANIZATION_PROVIDER,
        fn: renderOrganizationProvider,
    });
}
