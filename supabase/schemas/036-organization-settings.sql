/*
 * ---------------------------------------------------------------------------------
 * Organization Settings Schema
 * ---------------------------------------------------------------------------------
 * 
 * Purpose: Flexible key-value storage for organization preferences and configuration
 * 
 * Contains:
 * - Organization setting table for JSON-based configuration storage
 * - RLS policies for organization-specific settings access
 * - Automatic timestamp triggers
 * 
 * Dependencies: Organization table (030-organization.sql), Kit schema functions
 * Used by: Settings system for organization themes, preferences, and custom organization data
 */

------------------------------------- ORGANIZATION SETTING TABLE -------------------------------------

/*
 * Organization Setting TABLE: 
 * This table contains organization-specific setting data.
 * Stores additional organization preferences and configuration as JSON.
 * Provides flexible storage for settings that aren't core organization attributes.
 */
CREATE TABLE IF NOT EXISTS "public"."organization_setting" (
    id uuid unique not null default extensions.uuid_generate_v4(),
    organization_id uuid references public.organization (id) on delete cascade not null,
    name varchar(255) not null,
    value json DEFAULT '{"json":null}'::json NOT NULL,
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id)
);

------------------------------------- TABLE COMMENTS -------------------------------------

COMMENT ON TABLE "public"."organization_setting" IS 'Allow to store organization settings';
COMMENT ON COLUMN "public"."organization_setting"."organization_id" IS 'The organization id of the setting';
COMMENT ON COLUMN "public"."organization_setting"."name" IS 'The name of the setting';
COMMENT ON COLUMN "public"."organization_setting"."value" IS 'The value of the setting';

------------------------------------- PERMISSIONS -------------------------------------

REVOKE all on public.organization_setting from authenticated, service_role;
GRANT select, insert, update, delete on table public.organization_setting to authenticated, service_role;

-- Enable RLS on the organization_setting table
ALTER TABLE public.organization_setting ENABLE ROW LEVEL SECURITY;

------------------------------------- RLS POLICIES -------------------------------------

/*
 * Organization settings access policy
 * Users can access settings if they are members and have setting management permission
 */
CREATE POLICY organization_setting_all ON public.organization_setting
FOR ALL TO authenticated
USING (
  kit.user_is_member_of_org(organization_id) AND
  kit.has_org_permission(organization_id, 'setting.manage'::org_permission)
)
WITH CHECK (
  kit.user_is_member_of_org(organization_id) AND
  kit.has_org_permission(organization_id, 'setting.manage'::org_permission)
);

------------------------------------- TRIGGERS -------------------------------------

/*
 * Trigger: Update timestamp on organization setting changes
 * Automatically updates updated_at field when organization setting is modified
 */
CREATE TRIGGER reset_updated_at_on_organization_setting_update
AFTER UPDATE ON public.organization_setting
FOR EACH ROW
EXECUTE PROCEDURE kit.reset_updated_at (); 