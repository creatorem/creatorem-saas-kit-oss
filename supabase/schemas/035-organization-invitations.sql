/*
 * ---------------------------------------------------------------------------------
 * Organization Invitations Schema
 * ---------------------------------------------------------------------------------
 * 
 * Purpose: Organization invitation system for member recruitment
 * 
 * Contains:
 * - Organization invitation table with token-based invites
 * - Automatic expiration and duplicate handling
 * - RLS policies for invitation access control
 * - Triggers for invitation management and timestamp updates
 * 
 * Dependencies: Organization table (030-organization.sql), organization roles (032-organization-roles.sql), user table (021-user.sql)
 * Used by: Member invitation system, organization management UI
 */

------------------------------------- ORGANIZATION INVITATION TABLE -------------------------------------

/*
 * Organization Invitation TABLE: 
 * This table contains organization invitation data.
 * Manages email-based invitations with tokens, expiration, and role assignments.
 * Includes duplicate handling to prevent multiple invitations for same email/organization.
 */
CREATE TABLE IF NOT EXISTS "public"."organization_invitation" (
    id uuid unique not null default extensions.uuid_generate_v4(),
    email varchar(320) NOT NULL,
    organization_id uuid references public.organization (id) on delete cascade not null,
    role_id uuid references public.organization_role (id) on delete cascade not null,
    invite_token uuid UNIQUE NOT NULL DEFAULT "gen_random_uuid"(),
    invited_by uuid references public.user (id) on delete cascade not null default auth.uid(),
    expires_at timestamp without time zone DEFAULT ("now"() + '7 day'::interval) NOT NULL,
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id),
    UNIQUE(email, organization_id)
);

------------------------------------- TABLE COMMENTS -------------------------------------

COMMENT ON TABLE "public"."organization_invitation" IS 'Allow to store organization invitations';
COMMENT ON COLUMN "public"."organization_invitation"."email" IS 'The email of the invited user';
COMMENT ON COLUMN "public"."organization_invitation"."organization_id" IS 'The organization id of the invitation';
COMMENT ON COLUMN "public"."organization_invitation"."role_id" IS 'The role id for the invitation (references organization_role.id)';
COMMENT ON COLUMN "public"."organization_invitation"."invite_token" IS 'The token of the invitation';
COMMENT ON COLUMN "public"."organization_invitation"."invited_by" IS 'The user id of the invited user';
COMMENT ON COLUMN "public"."organization_invitation"."expires_at" IS 'The expiration date of the invitation';
COMMENT ON COLUMN "public"."organization_invitation"."updated_at" IS 'The last update date of the invitation';
COMMENT ON COLUMN "public"."organization_invitation"."created_at" IS 'The creation date of the invitation';

------------------------------------- PERMISSIONS -------------------------------------

REVOKE all on public.organization_invitation from authenticated, service_role;
GRANT select, insert, update, delete on table public.organization_invitation to authenticated, service_role;

-- Enable RLS on the organization_invitation table
ALTER TABLE public.organization_invitation ENABLE ROW LEVEL SECURITY;

------------------------------------- RLS POLICIES -------------------------------------

/*
 * Invitation creation policy
 * Users can create invitations if they have invitation management permission
 */
CREATE POLICY organization_invitation_create ON public.organization_invitation 
FOR INSERT TO authenticated 
WITH CHECK (
    kit.user_is_member_of_org(organization_id) AND
    kit.has_org_permission(organization_id, 'invitation.manage'::org_permission)
);

/*
 * Invitation read policy
 * Users can read invitations if they have manage permission or they created the invitation
 */
CREATE POLICY organization_invitation_read ON public.organization_invitation
FOR SELECT TO authenticated
USING (
  (kit.user_is_member_of_org(organization_id) AND (
    kit.has_org_permission(organization_id, 'invitation.manage'::org_permission) OR
    invited_by = kit.get_user_id()
  )) OR (email ilike kit.get_user_email())
);

/*
 * Invitation update policy
 * Users can update invitations if they have invitation management permission
 */
CREATE POLICY organization_invitation_update ON public.organization_invitation
FOR UPDATE TO authenticated
USING (
    kit.user_is_member_of_org(organization_id) AND
    kit.has_org_permission(organization_id, 'invitation.manage'::org_permission)
)
WITH CHECK (
    kit.user_is_member_of_org(organization_id) AND
    kit.has_org_permission(organization_id, 'invitation.manage'::org_permission)
);

/*
 * Invitation delete policy
 * Users can delete invitations if they have invitation management permission
 */
CREATE POLICY organization_invitation_delete ON public.organization_invitation
FOR DELETE TO authenticated
USING (
    (kit.user_is_member_of_org(organization_id) AND
    kit.has_org_permission(organization_id, 'invitation.manage'::org_permission)) OR (email ilike kit.get_user_email())
);

------------------------------------- TRIGGERS -------------------------------------

/*
 * Trigger: Handle duplicate invitations
 * Updates existing invitation instead of creating duplicate
 */
CREATE TRIGGER on_duplicate_invitation
BEFORE INSERT ON public.organization_invitation
FOR EACH ROW
EXECUTE FUNCTION kit.handle_duplicate_invitation();

/*
 * Trigger: Update timestamp on invitation changes
 * Automatically updates updated_at field when invitation is modified
 */
CREATE TRIGGER reset_updated_at_on_organization_invitation_update
AFTER UPDATE ON public.organization_invitation
FOR EACH ROW
EXECUTE PROCEDURE kit.reset_updated_at (); 