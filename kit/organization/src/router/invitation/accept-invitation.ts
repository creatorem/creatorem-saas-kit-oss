import { AppClient } from '@kit/db';
import { eq, notification as notificationTable, user as userTable } from '@kit/drizzle';
import { logger } from '@kit/utils';
import { z } from 'zod';
import { acceptInvitationSchema as schema } from '../../shared/schemas/invitation/accept-invitation-schema';
import { OrganizationDBClient } from '../../shared/server';
import { InvitationEngine } from '../../shared/server/invitation';

export const acceptInvitationSchema = schema;

export const acceptInvitationAction = async (
    { invitationId }: z.infer<typeof acceptInvitationSchema>,
    { db }: { db: AppClient },
) => {
    const user = await db.user.require();

    if (!user.email) {
        throw new Error('User email is required');
    }

    const actionCtx = {
        name: 'acceptInvitation',
    };

    try {
        const invitationEngine = new InvitationEngine(db);
        // First, get the invitation details to know which organization the user is joining
        const invitation = await invitationEngine.getInvitationById(invitationId);
        if (!invitation) {
            throw new Error('Invitation not found.');
        }

        const result = await invitationEngine.acceptInvitation({
            invitationId: invitationId,
            userEmail: user.email,
        });

        if (result === true) {
            logger.info(actionCtx, 'Successfully accepted invitation to organization');

            // Get the new membership data for the accepted invitation
            let newMembership = null;
            if (invitation?.organizationId) {
                const organizationClient = new OrganizationDBClient(db);
                const userMemberships = await organizationClient.getUserMemberships();
                newMembership =
                    userMemberships.find(
                        (m) => m.organizationId === invitation.organizationId && m.userId === user.id,
                    ) || null;
            }

            // Create organization notification
            await db.rls.transaction(async (tx) => {
                const [invitedUser] = await tx
                    .select()
                    .from(userTable)
                    .where(eq(userTable.email, invitation.email))
                    .limit(1);
                if (!invitedUser) throw new Error('invitedUser should be found to accept the invitation.');

                await tx.insert(notificationTable).values({
                    title: `${invitedUser.name} accepted your invitation`,
                    body: `${invitedUser.name} is now a member of the organzation.`,
                    userId: invitation.invitedBy,
                    organizationId: invitation.organizationId,
                });
            });

            // TODO: Add caching revalidation once caching system is implemented
            // TODO: Add subscription quantity update if billing is enabled

            return {
                success: true,
                newMembership: newMembership,
            };
        } else {
            // Handle specific error cases
            let errorMessage: string;
            switch (result) {
                case 'expired':
                    errorMessage = 'This invitation has expired';
                    break;
                case 'wrong_email':
                    errorMessage = 'This invitation is for a different email address';
                    break;
                case 'already_member':
                    errorMessage = 'You are already a member of this organization';
                    break;
                default:
                    errorMessage = 'Failed to accept invitation';
            }

            logger.error(
                {
                    ...actionCtx,
                    result,
                },
                `Failed to accept invitation: ${errorMessage}`,
            );

            throw new Error(errorMessage);
        }
    } catch (error) {
        logger.error(
            {
                ...actionCtx,
                error,
            },
            'Failed to accept invitation to organization',
        );

        throw error;
    }
};
