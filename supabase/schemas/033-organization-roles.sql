/*
 * ---------------------------------------------------------------------------------
 * Organization Roles and Permissions Schema
 * ---------------------------------------------------------------------------------
 * 
 * Purpose: Role hierarchy and permission system for organizations
 * 
 * Contains:
 * - Organization role definitions with hierarchy levels
 * - Role-permission mapping table
 * - RLS policies for role and permission access
 * - Seed data for default roles and permissions
 * 
 * Dependencies: Organization enums (010-enums.sql)
 * Used by: Organization member management, permission checking
 */

------------------------------------- ORGANIZATION ROLE TABLE -------------------------------------

/*
 * Organization Role TABLE: 
 * This table contains the organization role definitions.
 * Defines role hierarchy levels for permission inheritance and role comparisons.
 * Roles are now organization-specific, allowing custom role names per organization.
 * Seeded with default roles via trigger when organization is created.
 */
CREATE TABLE IF NOT EXISTS "public"."organization_role" (
    id uuid unique not null default extensions.uuid_generate_v4(),
    name varchar(100) NOT NULL,
    hierarchy_level integer NOT NULL,
    organization_id uuid references public.organization (id) on delete cascade not null,
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id),
    UNIQUE(name, organization_id)
);

------------------------------------- TABLE COMMENTS -------------------------------------

COMMENT ON TABLE "public"."organization_role" IS 'Allow to store organization-specific roles';
COMMENT ON COLUMN "public"."organization_role"."id" IS 'The unique id of the role';
COMMENT ON COLUMN "public"."organization_role"."name" IS 'The name of the role (unique per organization)';
COMMENT ON COLUMN "public"."organization_role"."hierarchy_level" IS 'Lower the value is, more important is the role.';
COMMENT ON COLUMN "public"."organization_role"."organization_id" IS 'The organization this role belongs to';
COMMENT ON COLUMN "public"."organization_role"."updated_at" IS 'The last update date of the role';
COMMENT ON COLUMN "public"."organization_role"."created_at" IS 'The creation date of the role';

------------------------------------- PERMISSIONS -------------------------------------

REVOKE all on public.organization_role from authenticated, service_role;
GRANT select, insert, update, delete on table public.organization_role to authenticated, service_role;

-- Enable RLS on the organization_role table
ALTER TABLE public.organization_role ENABLE ROW LEVEL SECURITY;

------------------------------------- ORGANIZATION ROLE PERMISSION TABLE -------------------------------------

/*
 * Organization Role Permission TABLE: 
 * This table maps permissions to organization roles.
 * Defines which permissions each role has within an organization.
 * Uses role_id to reference organization-specific roles.
 * Includes organization_id for efficient RLS policy evaluation.
 * Seeded with default role-permission mappings via trigger when organization is created.
 */
CREATE TABLE IF NOT EXISTS "public"."organization_role_permission" (
    id uuid unique not null default extensions.uuid_generate_v4(),
    role_id uuid references public.organization_role (id) on delete cascade not null,
    organization_id uuid references public.organization (id) on delete cascade not null,
    permission public.org_permission NOT NULL,
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id),
    UNIQUE(role_id, permission)
);

------------------------------------- TABLE COMMENTS -------------------------------------

COMMENT ON TABLE "public"."organization_role_permission" IS 'Allow to store organization role permissions';
COMMENT ON COLUMN "public"."organization_role_permission"."id" IS 'The unique id of the role permission';
COMMENT ON COLUMN "public"."organization_role_permission"."role_id" IS 'The role id that has this permission';
COMMENT ON COLUMN "public"."organization_role_permission"."organization_id" IS 'The organization id (denormalized for RLS efficiency)';
COMMENT ON COLUMN "public"."organization_role_permission"."permission" IS 'The permission granted to the role';
COMMENT ON COLUMN "public"."organization_role_permission"."updated_at" IS 'The last update date of the role permission';
COMMENT ON COLUMN "public"."organization_role_permission"."created_at" IS 'The creation date of the role permission';

------------------------------------- PERMISSIONS -------------------------------------

-- Reset the RLS access to authenticated and service_role roles
REVOKE all on public.organization_role_permission from authenticated, service_role;
GRANT select, insert, update, delete on table public.organization_role_permission to authenticated, service_role;

-- Enable RLS on the organization_role_permission table
ALTER TABLE public.organization_role_permission ENABLE ROW LEVEL SECURITY;

------------------------------------- RLS POLICIES -------------------------------------

/*
 * Organization role policies
 * Users can see roles for organizations they are members of
 * All members can see all roles in their organization (needed for invitation and member management)
 * Only users with role.manage permission can modify roles (to avoid recursion)
 */
CREATE POLICY organization_role_read ON public.organization_role
FOR SELECT TO authenticated
USING (
  kit.user_is_member_of_org(organization_id)
);

CREATE POLICY organization_role_insert ON public.organization_role
FOR INSERT TO authenticated
WITH CHECK (
  (kit.user_is_member_of_org(organization_id)) AND
  (kit.has_org_permission(organization_id, 'role.manage'))
);

CREATE POLICY organization_role_update ON public.organization_role
FOR UPDATE TO authenticated
USING (
  (kit.user_is_member_of_org(organization_id)) AND
  (kit.has_org_permission(organization_id, 'role.manage'))
)
WITH CHECK (
  (kit.user_is_member_of_org(organization_id)) AND
  (kit.has_org_permission(organization_id, 'role.manage'))
);

CREATE POLICY organization_role_delete ON public.organization_role
FOR DELETE TO authenticated
USING (
  (kit.user_is_member_of_org(organization_id)) AND
  (kit.has_org_permission(organization_id, 'role.manage'))
);

/*
 * Organization role permission policies
 * Users can see role permissions for organizations they are members of
 * All members can see all role permissions in their organization (needed for role management UI)
 * Only users with role.manage permission can modify role permissions (to avoid recursion)
 */
CREATE POLICY organization_role_permission_read ON public.organization_role_permission
FOR SELECT TO authenticated
USING (
  kit.user_is_member_of_org(organization_id)
);

CREATE POLICY organization_role_permission_insert ON public.organization_role_permission
FOR INSERT TO authenticated
WITH CHECK (
  (kit.user_is_member_of_org(organization_id)) AND
  (kit.has_org_permission(organization_id, 'role.manage'))
);

CREATE POLICY organization_role_permission_update ON public.organization_role_permission
FOR UPDATE TO authenticated
USING (
  (kit.user_is_member_of_org(organization_id)) AND
  (kit.has_org_permission(organization_id, 'role.manage'))
)
WITH CHECK (
  (kit.user_is_member_of_org(organization_id)) AND
  (kit.has_org_permission(organization_id, 'role.manage'))
);

-- we set organization_role_permission_delete in the 034-organization-members.sql file as we need the public.organization_member table to be set.

------------------------------------- FUNCTIONS -------------------------------------

/*
 * Function: Create default organization roles
 * Creates default roles and permissions for a new organization
 * Called automatically via trigger when organization is created
 * Uses SECURITY DEFINER to bypass RLS policies during initial setup
 */
CREATE OR REPLACE FUNCTION kit.create_default_organization_roles()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    contributor_role_id uuid;
    editor_role_id uuid;
BEGIN
    -- Create default roles for the new organization (insert them separately)
    INSERT INTO public.organization_role (name, hierarchy_level, organization_id)
    VALUES 
        ('editor', 1, NEW.id),
        ('contributor', 2, NEW.id);
    
    -- Get the role IDs separately for permission assignment
    SELECT id INTO contributor_role_id 
    FROM public.organization_role 
    WHERE name = 'contributor' AND organization_id = NEW.id;
    
    SELECT id INTO editor_role_id 
    FROM public.organization_role 
    WHERE name = 'editor' AND organization_id = NEW.id;
    
    -- Create default permissions for editor role (highest level)
    INSERT INTO public.organization_role_permission (role_id, organization_id, permission)
    VALUES 
        (editor_role_id, NEW.id, 'role.manage'),
        (editor_role_id, NEW.id, 'organization.manage'),
        (editor_role_id, NEW.id, 'member.manage'),
        (editor_role_id, NEW.id, 'invitation.manage'),
        (editor_role_id, NEW.id, 'setting.manage'),
        (editor_role_id, NEW.id, 'media.manage');
    
    -- Create default permissions for contributor role (basic level)
    INSERT INTO public.organization_role_permission (role_id, organization_id, permission)
    VALUES 
        (contributor_role_id, NEW.id, 'media.manage');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

------------------------------------- TRIGGERS -------------------------------------

/*
 * Trigger: Create default roles after organization creation
 * Automatically creates default roles and permissions for new organizations
 */
CREATE TRIGGER on_organization_create_default_roles
AFTER INSERT ON public.organization
FOR EACH ROW
EXECUTE PROCEDURE kit.create_default_organization_roles(); 