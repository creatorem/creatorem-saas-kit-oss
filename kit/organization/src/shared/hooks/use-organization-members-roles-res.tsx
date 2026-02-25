import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useTransition } from 'react';
import { organizationRouter } from '../../router/router';
import { useOrganization } from '../../shared/context';

export const useOrganizationMembersRolesRes = ({
    clientTrpc,
}: {
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
}) => {
    const { organization } = useOrganization();
    const [isPending, startTransition] = useTransition();
    const queryClient = useQueryClient();

    const membersRes = clientTrpc.getOrganizationMembers.useQuery({
        input: { organizationId: organization.id },
    });
    // const rolesRes = clientTrpc.getOrganizationRoles.useQuery({
    //     input: { organizationId: organization.id },
    // });

    const handleUpdateMemberRole = useCallback(
        async (memberId: string, roleId: string, roleName: string) => {
            return new Promise<void>((resolve, reject) => {
                startTransition(async () => {
                    try {
                        await clientTrpc.updateMemberRole.fetch({
                            memberId,
                            roleId,
                            organizationId: organization.id,
                        });

                        await queryClient.refetchQueries({
                            queryKey: [clientTrpc.getOrganizationMembers.key],
                        });
                        resolve();
                    } catch (error) {
                        await queryClient.refetchQueries({
                            queryKey: [clientTrpc.getOrganizationMembers.key],
                        });
                        reject(error);
                    }
                });
            });
        },
        [organization.id, clientTrpc, queryClient],
    );

    const handleRemoveMember = useCallback(
        async (memberId: string) => {
            return new Promise<void>((resolve, reject) => {
                startTransition(async () => {
                    try {
                        await clientTrpc.removeOrganizationMember.fetch({
                            memberId,
                            organizationId: organization.id,
                        });

                        await queryClient.refetchQueries({
                            queryKey: [clientTrpc.getOrganizationMembers.key],
                        });
                        resolve();
                    } catch (error) {
                        await queryClient.refetchQueries({
                            queryKey: [clientTrpc.getOrganizationMembers.key],
                        });
                        reject(error);
                    }
                });
            });
        },
        [organization.id, clientTrpc, queryClient],
    );

    return {
        handleUpdateMemberRole,
        handleRemoveMember,
        membersRes,
        // rolesRes,
    };
};
