import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { toast } from '@kit/ui/sonner';
import { AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { organizationRouter } from '../../router/router';
import { OrganizationProviderFromContext } from '../../shared';
import { useFiltersWithOrganization } from '../filters/use-filters-with-organization';
import { OrgConfig, wwwConfig } from '../../config';

const OrganizationProviderChildren = () => {
    useFiltersWithOrganization();
    return null;
};

export const WebOrganizationProvider: React.FC<{
    slug: string;
    children: React.ReactNode;
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
    loader: React.ReactNode;
    orgConfig: OrgConfig
}> = ({ children, clientTrpc, loader, slug: organizationSlug, orgConfig }) => {
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
            router.push(wwwConfig(orgConfig).urls.organizationRoot);
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
