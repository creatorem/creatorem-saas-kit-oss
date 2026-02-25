import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import React from 'react';
import { organizationRouter } from '../../router/router';
import { OrganizationProviderFromContext } from '../../shared';
import { useFiltersWithOrganization } from '../filters/use-filters-with-organization';

const OrganizationProviderChildren = () => {
    useFiltersWithOrganization();
    return null;
};

export const NativeOrganizationProvider: React.FC<{
    slug: string;
    children: React.ReactNode;
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
    loader: React.ReactNode;
}> = ({ children, clientTrpc, loader, slug: orgSlug }) => {
    const organizationSession = clientTrpc.getOrganizationSession.useQuery({ input: { orgSlug } });

    if (organizationSession.isPending) {
        return loader;
    }

    if (!organizationSession.data) {
        throw new Error('Organization session not received.');
    }

    return (
        <OrganizationProviderFromContext {...organizationSession.data} organizationSlug={orgSlug}>
            <OrganizationProviderChildren />
            {children}
        </OrganizationProviderFromContext>
    );
};
