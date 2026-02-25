import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { toast } from '@kit/ui/sonner';
import { dashboardRoutes } from '@kit/utils/config';
import { AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { organizationRouter } from '../../router/router';
import { OrganizationProviderFromContext } from '../../shared';
import { useFiltersWithOrganization } from '../filters/use-filters-with-organization';

const OrganizationProviderChildren = () => {
    useFiltersWithOrganization();
    return null;
};

export const WebOrganizationProvider: React.FC<{
    slug: string;
    children: React.ReactNode;
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
    loader: React.ReactNode;
}> = ({ children, clientTrpc, loader, slug: organizationSlug }) => {
    const router = useRouter();

    const {
        data: organizationData,
        isLoading,
        error,
    } = clientTrpc.getOrganizationSession.useQuery({
        input: {
            orgSlug: organizationSlug,
        },
    });

    useEffect(() => {
        if (!isLoading && !organizationData && error) {
            toast.error(error.message);
            router.push(dashboardRoutes.paths.dashboard.index);
        }
    }, [isLoading, organizationData, router, error]);

    if (isLoading || !organizationData) {
        return <AnimatePresence>{loader}</AnimatePresence>;
    }

    return (
        <OrganizationProviderFromContext {...organizationData} organizationSlug={organizationSlug}>
            <OrganizationProviderChildren />
            {children}
        </OrganizationProviderFromContext>
    );
};
