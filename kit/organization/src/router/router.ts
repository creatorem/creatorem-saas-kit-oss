import { CtxRouter } from '@creatorem/next-trpc';
import { AppClient } from '@kit/db';
import { OrganizationDBClient } from '../shared/server/organization-client';
import { checkIfSlugIsAvailableAction, checkIfSlugIsAvailableSchema } from './check-if-slug-is-available';
import { createOrganizationAction, createOrganizationSchema } from './create-organization';
// Organization role management
import { createOrganizationRoleAction, createOrganizationRoleSchema } from './create-organization-role';
import { deleteOrganizationRoleAction, deleteOrganizationRoleSchema } from './delete-organization-role';
// Organization member management
import { getOrganizationMembersAction, getOrganizationMembersSchema } from './get-organization-members';
import { getOrganizationRolesAction, getOrganizationRolesSchema } from './get-organization-roles';
import { getOrganizationSessionAction, getOrganizationSessionSchema } from './get-organization-session';
// Invitation management
import { acceptInvitationAction, acceptInvitationSchema } from './invitation/accept-invitation';
import { checkIfCanBeInvitedAction, checkIfCanBeInvitedSchema } from './invitation/check-if-can-be-invited';
import { declineInvitationAction, declineInvitationSchema } from './invitation/decline-invitation';
import {
    getOrganizationInvitationsAction,
    getOrganizationInvitationsSchema,
} from './invitation/get-organization-invitations';
import { getUserInvitationAction } from './invitation/get-user-invitation';
import { revokeInvitationAction, revokeInvitationSchema } from './invitation/revoke-invitation';
import { sendInvitationAction, sendInvitationSchema } from './invitation/send-invitation';
import { updateInvitationAction, updateInvitationSchema } from './invitation/update-invitation';
import {
    orgHasMultipleRoleManagePermissionsAction,
    orgHasMultipleRoleManagePermissionsSchema,
} from './org-has-multiple-role-manage-permissions';
import { removeOrganizationMemberAction, removeOrganizationMemberSchema } from './remove-organization-member';
import { updateMemberRoleAction, updateMemberRoleSchema } from './update-member-role';
import { updateOrganizationRoleAction, updateOrganizationRoleSchema } from './update-organization-role';
import { updateRolePermissionsAction, updateRolePermissionsSchema } from './update-role-permissions';

const ctx = new CtxRouter<{ db: AppClient }>();

export const organizationRouter = ctx.router({
    // Organization management
    createOrganization: ctx.endpoint.input(createOrganizationSchema).action(createOrganizationAction),
    checkIfSlugIsAvailable: ctx.endpoint.input(checkIfSlugIsAvailableSchema).action(checkIfSlugIsAvailableAction),
    getOrganizationSession: ctx.endpoint.input(getOrganizationSessionSchema).action(getOrganizationSessionAction),

    // User memberships
    organizationUserMemberships: ctx.endpoint.action(async ({ db }) => {
        const organizationClient = new OrganizationDBClient(db);
        const memberships = await organizationClient.getUserMemberships();
        return memberships;
    }),

    // Member management
    getOrganizationMembers: ctx.endpoint.input(getOrganizationMembersSchema).action(getOrganizationMembersAction),
    removeOrganizationMember: ctx.endpoint.input(removeOrganizationMemberSchema).action(removeOrganizationMemberAction),
    updateMemberRole: ctx.endpoint.input(updateMemberRoleSchema).action(updateMemberRoleAction),

    // Role management
    getOrganizationRoles: ctx.endpoint.input(getOrganizationRolesSchema).action(getOrganizationRolesAction),
    createOrganizationRole: ctx.endpoint.input(createOrganizationRoleSchema).action(createOrganizationRoleAction),
    updateOrganizationRole: ctx.endpoint.input(updateOrganizationRoleSchema).action(updateOrganizationRoleAction),
    deleteOrganizationRole: ctx.endpoint.input(deleteOrganizationRoleSchema).action(deleteOrganizationRoleAction),
    updateRolePermissions: ctx.endpoint.input(updateRolePermissionsSchema).action(updateRolePermissionsAction),
    orgHasMultipleRoleManagePermissions: ctx.endpoint
        .input(orgHasMultipleRoleManagePermissionsSchema)
        .action(orgHasMultipleRoleManagePermissionsAction),

    // Invitation management
    getUserInvitation: ctx.endpoint.action(getUserInvitationAction),
    acceptInvitation: ctx.endpoint.input(acceptInvitationSchema).action(acceptInvitationAction),
    declineInvitation: ctx.endpoint.input(declineInvitationSchema).action(declineInvitationAction),
    checkIfCanBeInvited: ctx.endpoint.input(checkIfCanBeInvitedSchema).action(checkIfCanBeInvitedAction),
    getOrganizationInvitations: ctx.endpoint
        .input(getOrganizationInvitationsSchema)
        .action(getOrganizationInvitationsAction),
    sendInvitation: ctx.endpoint.input(sendInvitationSchema).action(sendInvitationAction),
    revokeInvitation: ctx.endpoint.input(revokeInvitationSchema).action(revokeInvitationAction),
    updateInvitation: ctx.endpoint.input(updateInvitationSchema).action(updateInvitationAction),
});
