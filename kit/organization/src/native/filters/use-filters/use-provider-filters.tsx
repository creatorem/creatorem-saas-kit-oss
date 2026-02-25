'use client';

import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { organizationRouter } from '../../../router/router';
import { NativeOrganizationProvider } from '../../components';
import { Redirect } from 'expo-router';

/**
 * Enqueue all app events that need useOrganization to work.
 */
export function useProviderFilters({ clientTrpc }: { clientTrpc: TrpcClientWithQuery<typeof organizationRouter> }) {
    const membershipsRes = clientTrpc.organizationUserMemberships.useQuery();

    const RENDER_ORGANIZATION_PROVIDER = 'renderOrganizationProvider';
    const renderOrganizationProvider: FilterCallback<'display_trpc_provider_wrapper_in_mobile'> = (
        children,
        { clientTrpc, slug, loader },
    ) => {
        if (membershipsRes.isPending) {
            return loader;
        }

        if (!membershipsRes.data) {
            throw new Error('Memberships not received.');
        }

        const firstMembership = membershipsRes.data[0];

        if (!firstMembership) {
            return <Redirect href={'/onboarding/organization'} />
        }

        const finalSlug = slug ?? firstMembership.organization.slug
        if (!finalSlug) {
            throw new Error('Slug not defined.')
        }

        return (
            <NativeOrganizationProvider
                loader={loader}
                slug={finalSlug}
                clientTrpc={clientTrpc as TrpcClientWithQuery<typeof organizationRouter>}
            >
                {children}
            </NativeOrganizationProvider>
        );
    };

    useEnqueueFilter('display_trpc_provider_wrapper_in_mobile', {
        name: RENDER_ORGANIZATION_PROVIDER,
        fn: renderOrganizationProvider,
    });
}
