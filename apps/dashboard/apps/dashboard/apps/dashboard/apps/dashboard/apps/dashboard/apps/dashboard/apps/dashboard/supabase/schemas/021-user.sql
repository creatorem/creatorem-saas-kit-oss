/*
 * ---------------------------------------------------------------------------------
 * User Management Schema
 * ---------------------------------------------------------------------------------
 * 
 * Purpose: Core user table, authentication integration, and user management
 * 
 * Contains:
 * - User table definition with auth integration
 * - Row Level Security policies for user data
 * - User creation triggers and automation
 * - User media storage bucket and policies
 * 
 * Dependencies: Kit schema functions, enums
 * Related: user_setting (021), notifications (022), sessions (023)
 */

------------------------------------- USER TABLE -------------------------------------

/*
 * User TABLE: 
 * This table contains the user data.
 * It is linked to auth.users and serves as the public user profile.
 */
CREATE TABLE IF NOT EXISTS "public"."user" (
    id uuid unique not null default auth.uid(),
    auth_user_id uuid references auth.users on delete cascade not null default auth.uid(),
    name varchar(255) not null,
    email varchar(320),
    profile_url varchar(1000),
    phone varchar,
    completed_onboarding boolean default false not null,
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id)
);

------------------------------------- TABLE COMMENTS -------------------------------------

COMMENT ON TABLE "public"."user" IS '"User" contains data about a auth.users entity.';
COMMENT ON COLUMN "public"."user"."auth_user_id" IS 'The auth.users id of the user';
COMMENT ON COLUMN "public"."user"."name" IS 'The name of the user';
COMMENT ON COLUMN "public"."user"."email" IS 'The email of the user';
COMMENT ON COLUMN "public"."user"."updated_at" IS 'The last time the user was updated';
COMMENT ON COLUMN "public"."user"."created_at" IS 'The time the user was created';
COMMENT ON COLUMN "public"."user"."profile_url" IS 'The profile url of the user';
COMMENT ON COLUMN "public"."user"."phone" IS 'The phone number of the user';
COMMENT ON COLUMN "public"."user"."completed_onboarding" IS 'Whether the user has completed the onboarding process';

------------------------------------- PERMISSIONS -------------------------------------

-- Reset the RLS access to authenticated and service_role roles
revoke all on public.user from authenticated, service_role;
grant select, insert, update, delete on table public.user to authenticated, service_role;

-- Enable RLS on the user table
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;

------------------------------------- RLS POLICIES -------------------------------------

/*
 * User creation policy
 */
CREATE POLICY user_create ON public.user 
FOR INSERT TO authenticated 
WITH CHECK ((( SELECT auth.uid() AS uid) = auth_user_id));

/*
 * User read policy
 */
CREATE POLICY user_read ON public.user
FOR SELECT TO authenticated
-- for now it is public, may be interesting to limit access only to other users linked by a company
USING (true);

/*
 * User update policy
 */
CREATE POLICY user_update ON public.user
FOR UPDATE TO authenticated
USING ((( SELECT auth.uid() AS uid) = auth_user_id))
WITH CHECK ((( SELECT auth.uid() AS uid) = auth_user_id));

/*
 * User delete policy
 */
CREATE POLICY user_delete ON public.user
FOR DELETE TO authenticated
USING ((( SELECT auth.uid() AS uid) = auth_user_id));

------------------------------------- STORAGE SETUP -------------------------------------

/*
 * User Media Bucket
 * Public bucket for user profile media files (avatars, etc.)
 */
insert into storage.buckets (id, name, PUBLIC)
values ('user_media', 'user_media', true)
ON CONFLICT (id) DO NOTHING;

------------------------------------- STORAGE POLICIES -------------------------------------

/*
 * User media storage policy
 * Users can only access files in their own folder within user_media bucket
 */
CREATE POLICY "media_all" ON storage.objects
FOR ALL TO authenticated
USING ( 
    bucket_id = 'user_media' 
    and (storage.foldername(name))[1] = (select auth.uid()::text) 
    and (select auth.uid()) = owner_id::uuid 
)
WITH CHECK ( 
    bucket_id = 'user_media' 
    and (storage.foldername(name))[1] = (select auth.uid()::text) 
    and (select auth.uid()) = owner_id::uuid 
);

------------------------------------- TRIGGERS -------------------------------------

/*
 * Trigger: Setup new user after auth.users creation
 * Automatically creates user profile when auth user is created
 */
create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure kit.setup_new_user ();

/*
 * Trigger: Update timestamp on user changes
 * Automatically updates updated_at field when user record is modified
 */
create trigger reset_updated_at_on_user_on_update
after update on public.user for each row
execute procedure kit.reset_updated_at (); 