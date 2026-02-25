import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Organization, OrganizationInvitation, OrganizationRole } from '@kit/drizzle';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useTransition } from 'react';
import { organizationRouter } from '../../../router/router';

// Extended invitation type with organization details and role information
export interface UserInvitationWithOrganization extends OrganizationInvitation {
    organization: Organization;
    organizationRole: Pick<OrganizationRole, 'id' | 'name' | 'hierarchyLevel'>;
}

export const useInvitationResponder = ({
    clientTrpc,
}: {
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
}) => {
    const invitationRes = clientTrpc.getUserInvitation.useQuery();
    const [isPending, startTransition] = useTransition();

    const [processingInvitations, setProcessingInvitations] = useState<Set<string>>(new Set());

    const queryClient = useQueryClient();

    // Handle accepting invitation
    const handleAcceptInvitation = useCallback(
        async (invitationId: string) => {
            if (!Array.isArray(invitationRes.data)) return;

            return new Promise<void>((resolve, reject) => {
                startTransition(async () => {
                    try {
                        // Add invitation to processing set to show loading state
                        setProcessingInvitations((prev) => new Set(prev).add(invitationId));

                        await clientTrpc.acceptInvitation.fetch({ invitationId });

                        // Remove from processing set and from invitations list
                        setProcessingInvitations((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(invitationId);
                            return newSet;
                        });

                        await queryClient.refetchQueries({
                            queryKey: [clientTrpc.organizationUserMemberships.key],
                        });
                        await queryClient.refetchQueries({
                            queryKey: [clientTrpc.getOrganizationSession.key],
                        });

                        await invitationRes.refetch();

                        resolve();
                    } catch (error) {
                        // Remove from processing set on error
                        setProcessingInvitations((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(invitationId);
                            return newSet;
                        });

                        // Refresh on error to ensure consistency
                        await invitationRes.refetch();
                        reject(error);
                    }
                });
            });
        },
        [invitationRes, queryClient],
    );

    // Handle declining invitation
    const handleDeclineInvitation = useCallback(
        async (invitationId: string) => {
            if (!invitationRes.data) return;

            return new Promise<void>((resolve, reject) => {
                startTransition(async () => {
                    try {
                        // Use the delete invitation action to decline
                        await clientTrpc.declineInvitation.fetch({
                            id: invitationId,
                            organizationId:
                                invitationRes.data.find((inv) => inv.id === invitationId)?.organizationId || '',
                        });

                        await queryClient.refetchQueries({
                            queryKey: [clientTrpc.organizationUserMemberships.key],
                        });
                        await queryClient.refetchQueries({
                            queryKey: [clientTrpc.getOrganizationSession.key],
                        });

                        // Update local state optimistically
                        await invitationRes.refetch();

                        resolve();
                    } catch (error) {
                        // Refresh on error to ensure consistency
                        await invitationRes.refetch();
                        reject(error);
                    }
                });
            });
        },
        [invitationRes, queryClient],
    );

    return {
        processingInvitations,
        handleAcceptInvitation,
        handleDeclineInvitation,
        invitationRes,
    };
};
