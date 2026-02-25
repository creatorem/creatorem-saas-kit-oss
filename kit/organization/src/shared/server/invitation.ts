import { AppClient } from '@kit/db';
import {
    and,
    eq,
    ilike,
    inArray,
    organizationInvitation,
    organizationMember,
    organizationRole as organizationRoleTable,
    organization as organizationTable,
    sql,
    user,
} from '@kit/drizzle';
import { renderInviteUserEmail } from '@kit/email-templates';
import { EmailProvider } from '@kit/emailer';
import { logger } from '@kit/utils';
import { dashboardRoutes } from '@kit/utils/config';
import { UserInvitationWithOrganization } from '../invitation/hooks/use-invitation-responder';
import {
    type AcceptInvitationParams,
    type CreateInvitationParams,
    type InvitationEngineInterface,
    type SendInvitationParams,
} from '../types/invitation.types';
// import { type UserInvitationWithOrganization } from '../../components/invitation/user-invitations-view';

/**
 * Engine class that implements the invitation interface
 * This class provides a clean abstraction layer for testing and Storybook
 */
export class InvitationEngine implements InvitationEngineInterface {
    private db: AppClient;

    constructor(db: AppClient) {
        this.db = db;
    }

    /**
     * Check if an email can be invited to an organization
     */
    async checkIfCanInvite(
        email: string,
        organizationId: string,
    ): Promise<true | 'already_member' | 'invitation_already_sent'> {
        const normalizedEmail = email.toLowerCase();

        const [existingMember] = await this.db.rls.transaction(async (tx) => {
            // Check if user is already a member
            const memberQuery = await tx
                .select({ userId: organizationMember.userId })
                .from(organizationMember)
                .innerJoin(user, eq(organizationMember.userId, user.id))
                .where(and(eq(organizationMember.organizationId, organizationId), eq(user.email, normalizedEmail)))
                .limit(1);

            return memberQuery;
        });

        if (existingMember) {
            return 'already_member'; // Already a member
        }

        const [existingInvitation] = await this.db.rls.transaction(async (tx) => {
            // Check if there's already a pending invitation
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
     * Create a new invitation
     */
    async createInvitation(params: CreateInvitationParams) {
        const { email, roleId, organizationId } = params;

        const normalizedEmail = email.toLowerCase();

        /**
         * The kit.handle_duplicate_invitation trigger function will automatically
         * update a potential duplicated invitation, instead of insert a new one.
         */
        const [invitation] = await this.db.rls.transaction(async (tx) => {
            return await tx
                .insert(organizationInvitation)
                .values({
                    email: normalizedEmail,
                    roleId: roleId,
                    organizationId,
                })
                .returning();
        });

        if (!invitation) {
            throw new Error('Failed to create invitation');
        }

        return invitation;
    }

    /**
     * Send invitation email
     */
    async sendInvitationEmailRequest(params: SendInvitationParams): Promise<void> {
        // Create invitation link that matches the expected format in /invitations page
        const urlParams = new URLSearchParams({
            invite_token: params.token,
            email: params.email,
        });

        const inviteLink = `${dashboardRoutes.url}${dashboardRoutes.paths.invitations}?${urlParams.toString()}`;

        // to implement (put that way to fix ts errors)
        const { html, subject } = await renderInviteUserEmail({
            // appName: envs().NEXT_PUBLIC_APP_NAME || 'App',
            appConfig: {
                name: 'App',
                description: 'App',
                title: 'App',
                theme: 'light',
            },
            // organizationName: params.organizationName,
            inviteLink,
            name: params.email.split('@')[0] || 'Invitee',
            // inviteeName: params.email.split('@')[0], // Use email prefix as name
            // supportEmail: envs().SUPPORT_EMAIL,
        });

        const emailProvider = EmailProvider;

        await emailProvider.sendEmail({
            to: params.email,
            from: params.invitedByEmail,
            subject,
            html,
        });
    }

    /**
     * Check if user has admin permissions in organization
     */
    async isOrganizationAdmin(userId: string, organizationId: string): Promise<boolean> {
        const [member] = await this.db.rls.transaction(async (tx) => {
            return await tx
                .select({
                    roleHierarchyLevel: organizationRoleTable.hierarchyLevel,
                    isOwner: organizationMember.isOwner,
                })
                .from(organizationMember)
                .innerJoin(organizationRoleTable, eq(organizationMember.roleId, organizationRoleTable.id))
                .where(
                    and(eq(organizationMember.userId, userId), eq(organizationMember.organizationId, organizationId)),
                )
                .limit(1);
        });

        if (!member) {
            return false;
        }

        // Owner or role with hierarchy level >= 2 has admin permissions (editor is level 2)
        return member.isOwner || member.roleHierarchyLevel >= 2;
    }

    /**
     * Get invitation details by ID
     */
    async getInvitationById(invitationId: string) {
        try {
            const invitation = await this.db.rls.transaction(async (tx) => {
                const result = await tx
                    .select()
                    .from(organizationInvitation)
                    .where(eq(organizationInvitation.id, invitationId))
                    .limit(1);

                return result[0] || null;
            });

            return invitation;
        } catch (error) {
            logger.error({ error, invitationId }, 'Failed to get invitation by ID');
            return null;
        }
    }

    /**
     * Accept an invitation and add user to organization using SQL function
     */
    async acceptInvitation(
        params: AcceptInvitationParams,
    ): Promise<'expired' | 'wrong_email' | 'already_member' | true> {
        const { invitationId } = params;
        return await this.db.rls.transaction(async (tx) => {
            // Use the SQL function to accept the invitation
            const result = await tx.execute(sql`SELECT kit.accept_invitation(${invitationId})`);

            // const status = result.rows[0]?.status as string;
            const status = result[0]!.accept_invitation;

            switch (status) {
                case 'success':
                    return true;
                case 'expired':
                    return 'expired';
                case 'wrong_email':
                    return 'wrong_email';
                case 'already_member':
                    return 'already_member';
                default:
                    throw new Error(`Unexpected status from accept_invitation: ${status}`);
            }
        });
    }

    public async getUserInvitationsServer(): Promise<UserInvitationWithOrganization[]> {
        const user = await this.db.user.require();

        if (!user.email) {
            logger.error({ userId: user.id }, 'User email is required but not found');
            return [];
        }

        const userEmail = user.email.toLowerCase();
        logger.info(
            { userEmail, userId: user.id },
            'Fetching invitations for user email (server-side with Drizzle RLS)',
        );

        try {
            // Use Drizzle RLS transaction to query invitations with organization data
            const invitations = await this.db.rls.transaction(async (tx) => {
                // no need to filter using user email here, RLS will handle everything
                const invitations = await tx
                    .select()
                    .from(organizationInvitation)
                    .where(ilike(organizationInvitation.email, userEmail))
                    .leftJoin(organizationTable, eq(organizationInvitation.organizationId, organizationTable.id));

                logger.info(
                    {
                        userEmail,
                        userId: user.id,
                        invitationsCount: invitations?.length || 0,
                    },
                    'Drizzle RLS transaction query result for user invitations',
                );

                return invitations.map((invitation) => {
                    if (invitation.organization === null) {
                        throw new Error(
                            'Organization is not defined for the organization invitation "' +
                            invitation.organization_invitation.id +
                            '" .',
                        );
                    }
                    return invitation;
                });
            });

            const organizationRoleIds = invitations.map((inv) => inv.organization_invitation.roleId);

            const organizationRoles = await this.db.admin
                .select({
                    id: organizationRoleTable.id,
                    name: organizationRoleTable.name,
                    hierarchyLevel: organizationRoleTable.hierarchyLevel,
                })
                .from(organizationRoleTable)
                .where(inArray(organizationRoleTable.id, organizationRoleIds));

            // Create a map for quick lookups
            const rolesMap = new Map(organizationRoles.map((role) => [role.id, role]));

            // Merge the roles data with invitations
            const invitationsWithRoles = invitations.map((invitation) => {
                const role = rolesMap.get(invitation.organization_invitation.roleId);
                return {
                    ...invitation.organization_invitation,
                    organizationRole: role || {
                        id: invitation.organization_invitation.roleId,
                        name: 'Unknown Role',
                        hierarchyLevel: 0,
                    },
                    organization: invitation.organization,
                };
            });

            return invitationsWithRoles as UserInvitationWithOrganization[];
        } catch (error) {
            logger.error(
                { error, userEmail, userId: user.id },
                'Exception in getUserInvitationsServer (Drizzle RLS transaction)',
            );
            return [];
        }
    }
}
