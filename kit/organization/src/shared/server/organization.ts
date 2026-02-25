import { AppClient } from '@kit/db';
import {
    and,
    eq,
    Organization,
    organizationInvitation,
    organizationMember,
    organizationRole,
    user,
} from '@kit/drizzle';
// import { renderInviteUserEmail } from '@kit/email-templates';
// import { EmailProvider } from '@kit/emailer';
import { logger } from '@kit/utils';
// import { OrganizationDBClient } from '@kit/organization/shared/server';
import type {
    InviteMemberParams,
    OrganizationEngineInterface,
    OrganizationMemberWithUser,
    RemoveMemberParams,
    UpdateMemberRoleParams,
} from '../types/organization-service-types';
import { OrganizationDBClient } from './organization-client';

/**
 * Engine class for organization member management operations
 * Uses Drizzle ORM with RLS for secure database operations
 */
export class OrganizationEngine implements OrganizationEngineInterface {
    private db: AppClient;

    constructor(db: AppClient) {
        this.db = db;
    }

    getOrganizationSessionData(): Promise<any> {
        throw new Error('Method not implemented.');
    }
    /**
     * Get all members of an organization with their user information
     */
    async getOrganizationMembers(organizationId: string): Promise<OrganizationMemberWithUser[]> {
        const members = await this.db.rls.transaction(async (tx) => {
            return await tx
                .select({
                    id: organizationMember.id,
                    userId: organizationMember.userId,
                    organizationId: organizationMember.organizationId,
                    roleId: organizationMember.roleId,
                    roleName: organizationRole.name,
                    roleHierarchyLevel: organizationRole.hierarchyLevel,
                    isOwner: organizationMember.isOwner,
                    createdAt: organizationMember.createdAt,
                    updatedAt: organizationMember.updatedAt,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        profileUrl: user.profileUrl,
                    },
                })
                .from(organizationMember)
                .innerJoin(user, eq(organizationMember.userId, user.id))
                .innerJoin(organizationRole, eq(organizationMember.roleId, organizationRole.id))
                .where(eq(organizationMember.organizationId, organizationId))
                .orderBy(organizationMember.createdAt);
        });

        return members;
    }

    /**
     * Check if a user can be invited to an organization
     */
    async checkIfCanInviteMember(
        email: string,
        organizationId: string,
    ): Promise<true | 'already_member' | 'invitation_already_sent'> {
        const normalizedEmail = email.toLowerCase();

        // Check if user is already a member
        const [existingMember] = await this.db.rls.transaction(async (tx) => {
            return await tx
                .select({ userId: organizationMember.userId })
                .from(organizationMember)
                .innerJoin(user, eq(organizationMember.userId, user.id))
                .where(and(eq(organizationMember.organizationId, organizationId), eq(user.email, normalizedEmail)))
                .limit(1);
        });

        if (existingMember) {
            return 'already_member';
        }

        // Check if there's already a pending invitation
        const [existingInvitation] = await this.db.rls.transaction(async (tx) => {
            return await tx
                .select({ id: organizationInvitation.id })
                .from(organizationInvitation)
                .where(
                    and(
                        eq(organizationInvitation.email, normalizedEmail),
                        eq(organizationInvitation.organizationId, organizationId),
                    ),
                )
                .limit(1);
        });

        if (existingInvitation) {
            return 'invitation_already_sent';
        }

        return true;
    }

    /**
     * Invite a new member to the organization
     */
    async inviteMember(params: InviteMemberParams): Promise<{ invitationId: string }> {
        const { email, roleId, organizationId, organizationName, invitedByEmail, invitedByName } = params;
        const normalizedEmail = email.toLowerCase();

        // Create invitation
        const [invitation] = await this.db.rls.transaction(async (tx) => {
            return await tx
                .insert(organizationInvitation)
                .values({
                    email: normalizedEmail,
                    roleId: roleId,
                    organizationId,
                })
                .returning({
                    id: organizationInvitation.id,
                    token: organizationInvitation.inviteToken,
                });
        });

        if (!invitation) {
            throw new Error('Failed to create invitation');
        }

        // TODO: Send invitation email
        // Email functionality temporarily disabled for compilation
        logger.info({ email: normalizedEmail, organizationId, roleId }, 'Invitation created (email sending disabled)');

        return { invitationId: invitation.id };
    }

    /**
     * Update a member's role in the organization
     */
    async updateMemberRole(params: UpdateMemberRoleParams): Promise<void> {
        const { memberId, roleId, organizationId } = params;

        // Use RLS transaction for proper permission checking
        await this.db.rls.transaction(async (tx) => {
            return await tx
                .update(organizationMember)
                .set({ roleId: roleId })
                .where(and(eq(organizationMember.id, memberId), eq(organizationMember.organizationId, organizationId)));
        });

        logger.info({ memberId, roleId, organizationId }, 'Member role updated successfully');
    }

    /**
     * Remove a member from the organization
     */
    async removeMember(params: RemoveMemberParams): Promise<void> {
        const { memberId, organizationId } = params;

        await this.db.rls.transaction(async (tx) => {
            const [deletedMember] = await tx
                .delete(organizationMember)
                .where(and(eq(organizationMember.id, memberId), eq(organizationMember.organizationId, organizationId)))
                .returning({ id: organizationMember.id });

            if (!deletedMember) {
                throw new Error('Member not found or deletion failed');
            }
        });

        logger.info({ memberId, organizationId }, 'Member removed successfully');
    }

    /**
     * Check user permissions in organization
     */
    async checkUserPermissions(
        userId: string,
        organizationId: string,
    ): Promise<{ roleId: string; roleName: string; roleHierarchyLevel: number; isOwner: boolean } | null> {
        const [member] = await this.db.rls.transaction(async (tx) => {
            return await tx
                .select({
                    roleId: organizationMember.roleId,
                    roleName: organizationRole.name,
                    roleHierarchyLevel: organizationRole.hierarchyLevel,
                    isOwner: organizationMember.isOwner,
                })
                .from(organizationMember)
                .innerJoin(organizationRole, eq(organizationMember.roleId, organizationRole.id))
                .where(
                    and(eq(organizationMember.userId, userId), eq(organizationMember.organizationId, organizationId)),
                )
                .limit(1);
        });

        if (!member) {
            return null;
        }

        return {
            roleId: member.roleId,
            roleName: member.roleName,
            roleHierarchyLevel: member.roleHierarchyLevel,
            isOwner: member.isOwner,
        };
    }

    /**
     * Higher-level operations with built-in permission checking
     */

    /**
     * Get organization members with permission check
     */
    async getMembersWithPermissionCheck(userId: string, organizationId: string): Promise<OrganizationMemberWithUser[]> {
        // Check if user has access to this organization
        const permissions = await this.checkUserPermissions(userId, organizationId);
        if (!permissions) {
            throw new Error('You do not have access to this organization');
        }

        return await this.getOrganizationMembers(organizationId);
    }

    /**
     * Invite member with permission check
     */
    async inviteMemberWithPermissionCheck(
        userId: string,
        userEmail: string,
        userName: string,
        params: InviteMemberParams,
    ): Promise<{ invitationId: string }> {
        // Check if user has permission to invite members
        const permissions = await this.checkUserPermissions(userId, params.organizationId);
        if (!permissions || (permissions.roleHierarchyLevel < 2 && !permissions.isOwner)) {
            throw new Error('You do not have permission to invite members');
        }

        // Check if member can be invited
        const canInvite = await this.checkIfCanInviteMember(params.email, params.organizationId);
        if (canInvite !== true) {
            if (canInvite === 'already_member') {
                throw new Error('User is already a member of this organization');
            } else if (canInvite === 'invitation_already_sent') {
                throw new Error('User has already been invited to this organization');
            }
        }

        // Invite the member with the current user's details
        return await this.inviteMember({
            ...params,
            invitedByEmail: userEmail,
            invitedByName: userName,
        });
    }

    /**
     * Update member role with permission check
     */
    async updateMemberRoleWithPermissionCheck(userId: string, params: UpdateMemberRoleParams): Promise<void> {
        // Check if user has permission to edit roles
        const permissions = await this.checkUserPermissions(userId, params.organizationId);
        if (!permissions || (permissions.roleHierarchyLevel < 2 && !permissions.isOwner)) {
            throw new Error('You do not have permission to edit member roles');
        }

        await this.updateMemberRole(params);
    }

    /**
     * Remove member with permission check
     */
    async removeMemberWithPermissionCheck(userId: string, params: RemoveMemberParams): Promise<void> {
        // Check if user has permission to remove members
        const permissions = await this.checkUserPermissions(userId, params.organizationId);
        if (!permissions || (permissions.roleHierarchyLevel < 2 && !permissions.isOwner)) {
            throw new Error('You do not have permission to remove members');
        }

        await this.removeMember(params);
    }

    /**
     * Get organization by slug
     */
    async getOrganizationBySlug(slug: string): Promise<Organization | null> {
        const organizationClient = new OrganizationDBClient(this.db);

        return await organizationClient.getOrganizationBySlug(slug);
    }
}
