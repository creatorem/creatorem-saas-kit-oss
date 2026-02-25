/*
 * ---------------------------------------------------------------------------------
 * Organization Management Schema
 * ---------------------------------------------------------------------------------
 * 
 * Purpose: Core organization table, membership management, and organizational structure
 * 
 * Contains:
 * - Organization table with basic company information
 * - RLS policies for organization access control
 * - Automatic owner assignment triggers
 * - Timestamp management triggers
 * - Organization media storage bucket and policies
 * 
 * Dependencies: Kit organization utilities (000-kit-org.sql), organization enums (010-enums.sql)
 * Related: organization_role (031), organization_member (032), organization_invitation (033), organization_setting (034)
 */

------------------------------------- ORGANIZATION TABLE -------------------------------------

/*
 * Organization TABLE: 
 * This table contains the core organization data.
 * Stores basic company information including name, slug, contact details, and branding.
 */
CREATE TABLE IF NOT EXISTS "public"."organization" (
    id uuid unique not null default extensions.uuid_generate_v4(),
    name varchar(255) NOT NULL,
    slug text unique NOT NULL,
    address character varying,
    email varchar(320) unique,
    website varchar(320),
    logo_url varchar(1000),
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id)
);

------------------------------------- TABLE COMMENTS -------------------------------------

COMMENT ON TABLE "public"."organization" IS 'Allow to store organizations';
COMMENT ON COLUMN "public"."organization"."id" IS 'The id of the organization';
COMMENT ON COLUMN "public"."organization"."name" IS 'The name of the organization';
COMMENT ON COLUMN "public"."organization"."slug" IS 'The slug of the organization';
COMMENT ON COLUMN "public"."organization"."address" IS 'The address of the organization';
COMMENT ON COLUMN "public"."organization"."email" IS 'The email of the organization';
COMMENT ON COLUMN "public"."organization"."website" IS 'The website of the organization';
COMMENT ON COLUMN "public"."organization"."created_at" IS 'The creation date of the organization';

------------------------------------- PERMISSIONS -------------------------------------

REVOKE all on public.organization from authenticated, service_role;
GRANT select, insert, update, delete on table public.organization to authenticated, service_role;

-- Enable RLS on the organization table
ALTER TABLE public.organization ENABLE ROW LEVEL SECURITY;

------------------------------------- RLS POLICIES -------------------------------------

/*
 * Organization CREATE policy
 * Authenticated users can create new organizations
 */
CREATE POLICY organization_create ON public.organization 
FOR INSERT TO authenticated 
WITH CHECK (true);

/*
 * Organization READ policy
 * Users can only read organizations where they are members
 */
CREATE POLICY organization_read ON public.organization
FOR SELECT TO authenticated
USING (
  (kit.user_is_member_of_org(organization.id)) OR
  (kit.user_is_invited_to_org(organization.id))
);

/*
 * Organization UPDATE policy
 * Users can update organizations if they are members and have organization.manage permission
 */
CREATE POLICY organization_update ON public.organization
FOR UPDATE TO authenticated
USING (
  (kit.user_is_member_of_org(organization.id)) AND
  (kit.has_org_permission(organization.id, 'organization.manage'))
)
WITH CHECK (
  (kit.user_is_member_of_org(organization.id)) AND
  (kit.has_org_permission(organization.id, 'organization.manage'))
);

/*
 * Organization DELETE policy
 * Only organization owners can delete organizations
 */
CREATE POLICY organization_delete ON public.organization
FOR DELETE TO authenticated
USING ((kit.user_is_owner_of_org(organization.id)));

------------------------------------- STORAGE SETUP -------------------------------------

/*
 * Organization Media Bucket
 * Public bucket for organization media files (logos, images, etc.)
 * Organized by organization ID for easy access control
 */
insert into storage.buckets (id, name, PUBLIC)
values ('organization_media', 'organization_media', true)
ON CONFLICT (id) DO NOTHING;

------------------------------------- STORAGE POLICIES -------------------------------------

/*
 * Organization media storage policy
 * Users can access organization media if they:
 * - Are members of the organization (folder structure: {org_id}/...)
 * - Have media management permission for that organization
 */
CREATE POLICY "organization_media_all" ON storage.objects
FOR ALL TO authenticated
USING ( 
  bucket_id = 'organization_media' AND
  kit.user_is_member_of_org((storage.foldername(name))[1]::uuid) AND
  kit.has_org_permission((storage.foldername(name))[1]::uuid, 'media.manage'::org_permission)
)
WITH CHECK ( 
  bucket_id = 'organization_media' AND
  kit.user_is_member_of_org((storage.foldername(name))[1]::uuid) AND
  kit.has_org_permission((storage.foldername(name))[1]::uuid, 'media.manage'::org_permission)
);

------------------------------------- TRIGGERS -------------------------------------

/*
 * Trigger: Setup owner role after organization creation
 * Automatically assigns the creator as organization owner
 */
CREATE TRIGGER on_organization_created
AFTER INSERT ON public.organization
FOR EACH ROW
EXECUTE PROCEDURE kit.set_owner_organization_role ();

/*
 * Trigger: Update timestamp on organization changes
 * Automatically updates updated_at field when organization is modified
 */
CREATE TRIGGER reset_updated_at_on_organization_update
AFTER UPDATE ON public.organization
FOR EACH ROW
EXECUTE PROCEDURE kit.reset_updated_at (); 