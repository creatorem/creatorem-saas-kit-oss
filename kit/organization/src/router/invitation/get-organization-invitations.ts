import { AppClient } from '@kit/db';
import { desc, eq, organizationInvitation, organizationRole } from '@kit/drizzle';
import { z } from 'zod';
import { InvitationEngine } from '../../shared/server/invitation';

export const getOrganizationInvitationsSchema = z.object({
    organizationId: z.string().min(1),
});

export const getOrganizationInvitationsAction = async (
    { organizationId }: z.infer<typeof getOrganizationInvitationsSchema>,
    { db }: { db: AppClient },
) => {
    const user = await db.user.require();

    const invitationEngine = new InvitationEngine(db);
    // Check if user has permission to view invitations
    const isAdmin = await invitationEngine.isOrganizationAdmin(user.id, organizationId);

    if (!isAdmin) {
        throw new Error('Insufficient permissions to view invitations');
    }

    // Use Drizzle RLS client to query invitations with role information
    const invitations = await db.rls.transaction(async (tx) => {
        return await tx
            .select({
                id: organizationInvitation.id,
                email: organizationInvitation.email,
                organizationId: organizationInvitation.organizationId,
                roleId: organizationInvitation.roleId,
                roleName: organizationRole.name,
                roleHierarchyLevel: organizationRole.hierarchyLevel,
                inviteToken: organizationInvitation.inviteToken,
                invitedBy: organizationInvitation.invitedBy,
                createdAt: organizationInvitation.createdAt,
                updatedAt: organizationInvitation.updatedAt,
                expiresAt: organizationInvitation.expiresAt,
            })
            .from(organizationInvitation)
            .innerJoin(organizationRole, eq(organizationInvitation.roleId, organizationRole.id))
            .where(eq(organizationInvitation.organizationId, organizationId))
            .orderBy(desc(organizationInvitation.createdAt));
    });

    return { invitations };
};
