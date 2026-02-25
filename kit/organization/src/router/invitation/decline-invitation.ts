import { AppClient } from '@kit/db';
import { and, eq, notification as notificationTable, organizationInvitation, user as userTable } from '@kit/drizzle';
import { z } from 'zod';
import { declineInvitationSchema as schema } from '../../shared/schemas/invitation/delete-invitation-schema';

export const declineInvitationSchema = schema;

export const declineInvitationAction = async (
    { id, organizationId }: z.infer<typeof declineInvitationSchema>,
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

        await tx.delete(organizationInvitation).where(eq(organizationInvitation.id, id));

        // Create organization notification
        const [invitedUser] = await tx.select().from(userTable).where(eq(userTable.email, invitation.email)).limit(1);
        if (!invitedUser) throw new Error('invitedUser should be found to decline the invitation.');

        await tx.insert(notificationTable).values({
            title: `${invitedUser.name} declined your invitation`,
            body: `${invitedUser.name} has rejected the invitation to join your organization.`,
            userId: invitation.invitedBy,
            organizationId: invitation.organizationId,
        });

        // TODO: Add caching revalidation once caching system is implemented
        // revalidateTag(
        //   Caching.createOrganizationTag(
        //     OrganizationCacheKey.Invitations,
        //     organizationId
        //   )
        // );

        return { success: true };
    });
};
