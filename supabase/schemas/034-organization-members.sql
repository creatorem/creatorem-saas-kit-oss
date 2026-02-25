/*
 * ---------------------------------------------------------------------------------
 * Organization Members Schema
 * ---------------------------------------------------------------------------------
 * 
 * Purpose: Organization membership management and user-organization relationships
 * 
 * Contains:
 * - Organization member table linking users to organizations
 * - Owner designation and role assignment
 * - RLS policies for member access control
 * - Automatic timestamp triggers
 * 
 * Dependencies: Organization table (030-organization.sql), organization roles (032-organization-roles.sql), user table (021-user.sql)
 * Used by: Organization access control, permission checking, membership management UI
 */

------------------------------------- ORGANIZATION MEMBER TABLE -------------------------------------

/*
 * Organization Member TABLE: 
 * This table contains organization membership data.
 * Links users to organizations with specific roles and ownership status.
 * Created automatically when organization is created (owner) or invitation is accepted.
 */
CREATE TABLE IF NOT EXISTS "public"."organization_member" (
    id uuid unique not null default extensions.uuid_generate_v4(),
    is_owner boolean DEFAULT false NOT NULL,
    role_id uuid references public.organization_role (id) on delete cascade not null,
    user_id uuid references public.user (id) on delete cascade not null,
    organization_id uuid references public.organization (id) on delete cascade not null,
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id),
    UNIQUE(user_id, organization_id)
);

------------------------------------- TABLE COMMENTS -------------------------------------

COMMENT ON TABLE "public"."organization_member" IS 'Allow to store organization members';
COMMENT ON COLUMN "public"."organization_member"."is_owner" IS 'Whether the member is the owner of the organization';
COMMENT ON COLUMN "public"."organization_member"."role_id" IS 'The role id of the member (references organization_role.id)';
COMMENT ON COLUMN "public"."organization_member"."user_id" IS 'The user id of the member';
COMMENT ON COLUMN "public"."organization_member"."organization_id" IS 'The organization id of the member';
COMMENT ON COLUMN "public"."organization_member"."updated_at" IS 'The last update date of the member';
COMMENT ON COLUMN "public"."organization_member"."created_at" IS 'The creation date of the member';

------------------------------------- PERMISSIONS -------------------------------------

-- Reset the RLS access to authenticated and service_role roles
REVOKE all on public.organization_member from authenticated, service_role;
GRANT select, insert, update, delete on table public.organization_member to authenticated, service_role;

-- Enable RLS on the organization_member table
ALTER TABLE public.organization_member ENABLE ROW LEVEL SECURITY;

------------------------------------- RLS POLICIES -------------------------------------

/*
 * Member creation policy
 * Only allows creation through triggers (invitation acceptance) or service role
 */
CREATE POLICY organization_member_create ON public.organization_member 
FOR INSERT TO authenticated 
WITH CHECK (kit.user_is_invited_to_org(organization_member.organization_id));

/*
 * Member read policy
 * Users can read all organization members (needed for triggers to work)
 * TODO: Implement more restrictive policy after fixing trigger compatibility
 */
CREATE POLICY organization_member_read ON public.organization_member
FOR SELECT TO authenticated
USING (true);
-- Note: Originally tried this policy but it doesn't work with triggers:
-- USING (
--   kit.user_is_member_of_org(organization_member.organization_id) AND (
--     (kit.has_org_permission(organization_member.organization_id, 'member.manage')) OR
--     (organization_member.user_id = kit.get_user_id())
--   )
-- );

/*
 * Member update policy
 * Users can update members if they have member management permission and their role is higher
 */
CREATE POLICY organization_member_update ON public.organization_member
FOR UPDATE TO authenticated
USING (
  (kit.user_is_member_of_org(organization_member.organization_id)) AND
  (kit.has_org_permission(organization_member.organization_id, 'member.manage')) AND
  (kit.user_org_role_is_higher_than(organization_member.organization_id, organization_member.user_id))
)
WITH CHECK (
  (kit.user_is_member_of_org(organization_member.organization_id)) AND
  (kit.has_org_permission(organization_member.organization_id, 'member.manage')) AND
  (kit.user_org_role_is_higher_than(organization_member.organization_id, organization_member.user_id))
);

/*
 * Member delete policy
 * Users can delete their own membership or manage members if they have permission and higher role
 */
CREATE POLICY organization_member_delete ON public.organization_member
FOR DELETE TO authenticated
USING (
  kit.user_is_member_of_org(organization_member.organization_id) AND (
    (organization_member.user_id = kit.get_user_id()) OR
    (
      (kit.has_org_permission(organization_member.organization_id, 'member.manage')) AND
      (kit.user_org_role_is_higher_than(organization_member.organization_id, organization_member.user_id))
    )
  )
);

-- table set in 033-organization-roles.sql

CREATE POLICY organization_role_permission_delete ON public.organization_role_permission
FOR DELETE TO authenticated
USING (
  (kit.user_is_member_of_org(organization_id)) AND
  (kit.has_org_permission(organization_id, 'role.manage')) AND
  (
    -- Allow deletion if not removing role.manage permission
    permission != 'role.manage' OR
    -- OR if removing role.manage, ensure there are multiple roles with it
    -- AND at least one user has role.manage from a different role
    (
      kit.has_multiple_role_manage_permissions(organization_id) AND
      EXISTS (
        SELECT 1
        FROM public.organization_member om
        JOIN public.organization_role_permission orp ON orp.role_id = om.role_id
        WHERE om.organization_id = organization_role_permission.organization_id
          AND orp.permission = 'role.manage'
          AND om.role_id != organization_role_permission.role_id
      )
    )
  )
);

------------------------------------- TRIGGERS -------------------------------------

/*
 * Trigger: Update timestamp on member changes
 * Automatically updates updated_at field when member record is modified
 */
CREATE TRIGGER reset_updated_at_on_organization_member_update
AFTER UPDATE ON public.organization_member
FOR EACH ROW
EXECUTE PROCEDURE kit.reset_updated_at (); 