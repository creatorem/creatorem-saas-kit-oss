import { AppClient } from '@kit/db';
import { and, eq, organizationInvitation, organizationRole } from '@kit/drizzle';
import { ForbiddenError } from '@kit/utils';
import { z } from 'zod';
import { updateInvitationSchema as schema } from '../../shared/schemas/invitation/update-invitation-schema';
import { InvitationEngine } from '../../shared/server/invitation';

export const updateInvitationSchema = schema;

export const updateInvitationAction = async (
    { id, roleId, organizationId }: z.infer<typeof updateInvitationSchema>,
    { db }: { db: AppClient },
) => {
    const user = await db.user.require();

    return await db.rls.transaction(async (tx) => {
        // Get current invitation with role information
        const [invitation] = await tx
            .select({
                email: organizationInvitation.email,
                currentRoleId: organizationInvitation.roleId,
                currentRoleHierarchyLevel: organizationRole.hierarchyLevel,
            })
            .from(organizationInvitation)
            .innerJoin(organizationRole, eq(organizationInvitation.roleId, organizationRole.id))
            .where(and(eq(organizationInvitation.organizationId, organizationId), eq(organizationInvitation.id, id)))
            .limit(1);

        if (!invitation) {
            throw new Error('Invitation not found');
        }

        // Get new role information
        const [newRole] = await tx
            .select({
                hierarchyLevel: organizationRole.hierarchyLevel,
            })
            .from(organizationRole)
            .where(eq(organizationRole.id, roleId))
            .limit(1);

        if (!newRole) {
            throw new Error('Invalid role selected');
        }

        // Check permissions for updating to higher privilege role (hierarchy level >= 2)
        if (invitation.currentRoleHierarchyLevel < 2 && newRole.hierarchyLevel >= 2) {
            const invitationEngine = new InvitationEngine(db);
            const currentUserIsAdmin = await invitationEngine.isOrganizationAdmin(user.id, organizationId);
            if (!currentUserIsAdmin) {
                throw new ForbiddenError('Insufficient permissions to assign high privilege roles');
            }
        }

        await tx.update(organizationInvitation).set({ roleId: roleId }).where(eq(organizationInvitation.id, id));

        // TODO: Add caching revalidation once caching system is implemented
        // revalidateTag(
        //   Caching.createOrganizationTag(
        //     OrganizationCacheKey.Invitations,
        //     parsedInput.organizationId
        //   )
        // );

        return { success: true };
    });
};
