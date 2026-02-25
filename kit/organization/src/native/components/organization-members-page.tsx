import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { View } from 'react-native';
import { organizationRouter } from '../../router/router';
import { OrganizationInvitationsPage } from './invitation/organization-invitations-page';
import { OrganizationMembersManager } from './organization-members-manager';

interface OrganizationMembersPageProps {
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
}

export function OrganizationMembersPage({ clientTrpc }: OrganizationMembersPageProps) {
    return (
        <View className="flex flex-col gap-6">
            <OrganizationMembersManager clientTrpc={clientTrpc} />
            <OrganizationInvitationsPage clientTrpc={clientTrpc} />
        </View>
    );
}
