import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import type { toast as rnToast } from '@kit/native-ui/sonner';
import { useOrganization } from '@kit/organization/shared';
import type { toast as wwwToast } from '@kit/ui/sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useTransition } from 'react';
import { organizationRouter } from '../../router/router';

export const useOrganizationInvitationControllers = ({
    clientTrpc,
    toast,
}: {
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
    toast: typeof rnToast | typeof wwwToast;
}) => {
    const [isPending, startTransition] = useTransition();
    const queryClient = useQueryClient();
    const { organization, permissions, member: currentMember } = useOrganization();

    const canInviteMembers = permissions.includes('invitation.manage') || currentMember.isOwner;

    const invitationsRes = clientTrpc.getOrganizationInvitations.useQuery({
        input: { organizationId: organization.id },
    });

    const handleSendInvitation = useCallback(
        async (data: { email: string; roleId: string; organizationId: string; organizationName: string }) => {
            return new Promise<any>((resolve, reject) => {
                startTransition(async () => {
                    try {
                        const result = await clientTrpc.sendInvitation.fetch(data);

                        if ('error' in result && result.error) {
                            toast.error(result.error);
                            reject(new Error('Failed to send invitation'));
                            return;
                        }

                        if (!result.invitationId) {
                            toast.error('Invitation id not found in the response.');
                            reject(new Error('Invitation id not found in the response.'));
                            return;
                        }

                        await queryClient.refetchQueries({
                            queryKey: [clientTrpc.getOrganizationInvitations.key],
                        });
                        resolve(result.invitationId);
                    } catch (error) {
                        await queryClient.refetchQueries({
                            queryKey: [clientTrpc.getOrganizationInvitations.key],
                        });

                        reject(error);
                    }
                });
            });
        },
        [clientTrpc],
    );

    const handleDeleteInvitation = useCallback(
        async (invitationId: string) => {
            return new Promise<void>((resolve, reject) => {
                startTransition(async () => {
                    try {
                        await clientTrpc.declineInvitation.fetch({
                            id: invitationId,
                            organizationId: organization.id,
                        });

                        await queryClient.refetchQueries({
                            queryKey: [clientTrpc.getOrganizationInvitations.key],
                        });

                        resolve();
                    } catch (error) {
                        await queryClient.refetchQueries({
                            queryKey: [clientTrpc.getOrganizationInvitations.key],
                        });
                        reject(error);
                    }
                });
            });
        },
        [organization, clientTrpc],
    );

    const handleResendInvitation = useCallback(
        async (invitationId: string) => {
            return new Promise<void>((resolve, reject) => {
                startTransition(async () => {
                    try {
                        if (!invitationsRes.data) return;

                        const invitation = invitationsRes.data.invitations.find((inv) => inv.id === invitationId);
                        if (!invitation) {
                            throw new Error('Invitation not found');
                        }

                        await clientTrpc.declineInvitation.fetch({
                            id: invitationId,
                            organizationId: organization.id,
                        });

                        await clientTrpc.sendInvitation.fetch({
                            email: invitation.email,
                            roleId: invitation.roleId!,
                            organizationId: organization.id,
                            organizationName: organization?.name || 'Organization',
                        });

                        await queryClient.refetchQueries({
                            queryKey: [clientTrpc.getOrganizationInvitations.key],
                        });

                        resolve();
                    } catch (error) {
                        await queryClient.refetchQueries({
                            queryKey: [clientTrpc.getOrganizationInvitations.key],
                        });

                        reject(error);
                    }
                });
            });
        },
        [organization, invitationsRes, clientTrpc],
    );

    const handleUpdateInvitation = useCallback(async () => {
        await queryClient.refetchQueries({
            queryKey: [clientTrpc.getOrganizationInvitations.key],
        });
    }, []);

    return {
        invitationsRes,
        handleDeleteInvitation,
        handleResendInvitation,
        canInviteMembers,
        currentMember,
        handleSendInvitation,
        handleUpdateInvitation,
    };
};
