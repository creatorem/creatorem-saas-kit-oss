'use client';

import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { OrganizationInvitationsPage } from '@kit/organization/www/ui';
import { organizationRouter } from '../../router/router';
import { OrganizationMembersManager } from './organization-members-manager';

interface OrganizationMembersPageProps {
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
}

export function OrganizationMembersPage({ clientTrpc }: OrganizationMembersPageProps) {
    return (
        <div className="flex flex-col gap-6">
            <OrganizationMembersManager clientTrpc={clientTrpc} />
            <OrganizationInvitationsPage clientTrpc={clientTrpc} />
        </div>
    );
}
