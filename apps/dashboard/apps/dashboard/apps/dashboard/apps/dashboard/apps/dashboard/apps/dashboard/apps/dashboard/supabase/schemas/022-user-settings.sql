/*
 * ---------------------------------------------------------------------------------
 * User Settings Schema
 * ---------------------------------------------------------------------------------
 * 
 * Purpose: Flexible key-value storage for additional user preferences and settings
 * 
 * Contains:
 * - User setting table for JSON-based configuration storage
 * - RLS policies for user-specific settings access
 * - Automatic timestamp triggers
 * 
 * Dependencies: User table (021-user.sql), Kit schema functions
 * Used by: Settings system for themes, preferences, and custom user data
 */

------------------------------------- USER SETTING TABLE -------------------------------------

/*
 * User Setting TABLE: 
 * This table contains the user setting data.
 * It is used to store additional user preferences and configuration as JSON.
 * Provides flexible storage for settings that aren't core user attributes.
 */
CREATE TABLE IF NOT EXISTS "public"."user_setting" (
    id uuid unique not null default extensions.uuid_generate_v4(),
    user_id uuid references public.user (id) on delete cascade not null,
    name varchar(255) not null,
    value json DEFAULT '{"json":null}'::json NOT NULL,
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id)
);

------------------------------------- TABLE COMMENTS -------------------------------------

COMMENT ON TABLE "public"."user_setting" IS 'Allow to store additional data about a user (most of the time, those data aren''t required on user creation)';
COMMENT ON COLUMN "public"."user_setting"."name" IS 'The name of the setting';
COMMENT ON COLUMN "public"."user_setting"."value" IS 'The value of the setting';

------------------------------------- PERMISSIONS -------------------------------------

-- Reset the RLS access to authenticated and service_role roles
REVOKE all on public.user_setting from authenticated, service_role;
GRANT select, insert, update, delete on table public.user_setting to authenticated, service_role;

-- Enable RLS on the user_setting table
ALTER TABLE public.user_setting ENABLE ROW LEVEL SECURITY;

------------------------------------- RLS POLICIES -------------------------------------

/*
 * User settings policy
 * Users can only access settings that belong to them through user_id relationship
 */
CREATE POLICY user_setting_all ON public.user_setting
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user
        WHERE ((public.user.id = user_setting.user_id) AND (public.user.auth_user_id = auth.uid()))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user
        WHERE ((public.user.id = user_setting.user_id) AND (public.user.auth_user_id = auth.uid()))
    )
);

------------------------------------- TRIGGERS -------------------------------------

/*
 * Trigger: Update timestamp on user setting changes
 * Automatically updates updated_at field when user setting is modified
 */
create trigger reset_updated_at_on_user_setting_on_update
after update on public.user_setting for each row
execute procedure kit.reset_updated_at (); 