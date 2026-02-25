import { AppClient } from '@kit/db';
import { eq, notification as notificationTable, organizationRole, user as userTable } from '@kit/drizzle';
import { z } from 'zod';
import { sendInvitationSchema as schema } from '../../shared/schemas/invitation/send-invitation-schema';
import { InvitationEngine } from '../../shared/server/invitation';

export const sendInvitationSchema = schema;

export const sendInvitationAction = async (
    { email, roleId, organizationId, organizationName }: z.infer<typeof sendInvitationSchema>,
    { db }: { db: AppClient },
) => {
    const user = await db.user.require();

    const [roleInfo] = await db.rls.transaction(async (tx) => {
        return await tx.select().from(organizationRole).where(eq(organizationRole.id, roleId)).limit(1);
    });

    if (!roleInfo) {
        return {
            error: 'Invalid role selected',
        };
    }

    const invitationEngine = new InvitationEngine(db);

    // Check admin permissions for editor role invitations (hierarchy level >= 2)
    if (roleInfo.hierarchyLevel >= 2) {
        const currentUserIsAdmin = await invitationEngine.isOrganizationAdmin(user.id, organizationId);
        if (!currentUserIsAdmin) {
            return {
                error: 'Insufficient permissions to invite users with this role',
            };
        }
    }

    const result = await invitationEngine.checkIfCanInvite(email, organizationId);
    if (result !== true) {
        if (result === 'already_member') {
            return {
                error: 'User is already a member of this organization',
            };
        } else if (result === 'invitation_already_sent') {
            return {
                error: 'User has already been invited to this organization',
            };
        } else {
            return {
                error: 'User cannot be invited',
            };
        }
    }

    const invitation = await invitationEngine.createInvitation({
        email: email,
        roleId: roleId,
        organizationId: organizationId,
    });

    if (invitation) {
        // Create notification
        await db.rls.transaction(async (tx) => {
            const [invitedUser] = await tx
                .select()
                .from(userTable)
                .where(eq(userTable.email, invitation.email))
                .limit(1);
            if (invitedUser) {
                await tx.insert(notificationTable).values({
                    title: `You have been invited to join ${organizationName} as ${roleInfo.name}.`,
                    body: 'Accept or decline the invitation.',
                    userId: invitedUser.id,
                });
            }
        });
    }

    // TODO: Add caching revalidation once caching system is implemented
    // revalidateTag(
    //   Caching.createOrganizationTag(
    //     OrganizationCacheKey.Invitations,
    //     organizationId
    //   )
    // );

    await invitationEngine.sendInvitationEmailRequest({
        email: email,
        organizationName: organizationName,
        invitedByEmail: user.email || '',
        invitedByName: user.name || '',
        token: invitation.inviteToken,
        invitationId: invitation.id,
        organizationId: organizationId,
    });

    return { invitationId: invitation.id };
};
