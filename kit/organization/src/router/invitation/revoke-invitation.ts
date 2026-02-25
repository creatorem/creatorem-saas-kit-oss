import { AppClient } from '@kit/db';
import { and, eq, notification, organizationInvitation, user as userTable } from '@kit/drizzle';
import { logger } from '@kit/utils';
import { z } from 'zod';
import { revokeInvitationSchema as schema } from '../../shared/schemas/invitation/revoke-invitation-schema';

export const revokeInvitationSchema = schema;

export const revokeInvitationAction = async (
    { id, organizationId, organizationName }: z.infer<typeof revokeInvitationSchema>,
    { db }: { db: AppClient },
) => {
    return await db.rls.transaction(async (tx) => {
        const [invitation] = await tx
            .select()
            .from(organizationInvitation)
            .where(and(eq(organizationInvitation.organizationId, organizationId), eq(organizationInvitation.id, id)))
            .limit(1);

        if (!invitation) {
            throw new Error('Invitation not found');
        }

        // Instead of updating status, we delete the invitation to "revoke" it
        await tx
            .delete(organizationInvitation)
            .where(and(eq(organizationInvitation.organizationId, organizationId), eq(organizationInvitation.id, id)));

        const [invitedUser] = await tx.select().from(userTable).where(eq(userTable.email, invitation.email)).limit(1);
        if (invitedUser) {
            // Create organization notification
            await tx.insert(notification).values({
                title: `Your invitation to join ${organizationName} has been revoked.`,
                body: `You cannot joint ${organizationName} anymore.`,
                userId: invitedUser.id,
            });
        }

        try {
            // @todo: Add revoked invitation email functionality
            // await sendRevokedInvitationEmail({
            //   recipient: invitation.email,
            //   appName: 'Your App',
            //   organizationName: organizationName
            // });
            logger.info(
                {
                    invitationId: id,
                    email: invitation.email,
                    organizationName: organizationName,
                },
                'Invitation revoked',
            );
        } catch (e) {
            logger.error({ error: e }, 'Failed to send revoked invitation email');
        }

        // @todo: Add caching revalidation once caching system is implemented
        // revalidateTag(
        //   Caching.createOrganizationTag(
        //     OrganizationCacheKey.Invitations,
        //     organizationId
        //   )
        // );

        return { success: true };
    });
};
