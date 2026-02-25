import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Skeleton } from '@kit/native-ui/skeleton';
import { organizationRouter } from '../../../router/router';
import { useInvitationResponder } from '../../../shared/invitation/hooks/use-invitation-responder';
import { UserInvitationsView } from './user-invitations-view';

interface UserInvitationsPageProps {
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
}

export function UserInvitationsPage({ clientTrpc }: UserInvitationsPageProps) {
    const { processingInvitations, handleAcceptInvitation, handleDeclineInvitation, invitationRes } =
        useInvitationResponder({
            clientTrpc,
        });

    if (invitationRes.isPending || !invitationRes.data) {
        return <Skeleton className="h-48 w-full" />;
    }

    return (
        <UserInvitationsView
            invitations={invitationRes.data}
            onAcceptInvitation={handleAcceptInvitation}
            onDeclineInvitation={handleDeclineInvitation}
            processingInvitations={processingInvitations}
        />
    );
}
