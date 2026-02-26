/*
 * ---------------------------------------------------------------------------------
 * Kit Schema - Utility Functions and Core Business Logic
 * ---------------------------------------------------------------------------------
 * 
 * Purpose: Core utility functions and reusable business logic components
 * 
 * Contains:
 * - Kit schema creation and permissions
 * - User management utilities (get_user_id, setup_new_user)
 * - Organization permission and role checking functions
 * - Database trigger utilities (reset_updated_at)
 * - Storage bucket setup
 * 
 * Dependencies: Privileges must be set first
 * Used by: All other schemas that need utility functions
 */

------------------------------------- CREATE KIT SCHEMA -------------------------------------

-- Create kit schema for utility functions
create schema if not exists kit;

-- Grant permissions to the kit schema
GRANT USAGE ON SCHEMA kit TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA kit TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA kit TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA kit TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA kit GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA kit GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA kit GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

------------------------------------- CORE USER FUNCTIONS -------------------------------------

/*
 * [FUNCTION] get_user_id 
 * This function returns the user.id of the current authenticated user.
 */
CREATE OR REPLACE FUNCTION kit.get_user_id() RETURNS uuid
SET search_path = ''
as $$
DECLARE
  auth_uid uuid;
  user_id uuid;
BEGIN
    auth_uid := auth.uid();

    -- check user_auth_id is not null
    IF auth_uid IS NULL THEN
        RETURN null;
    END IF;

    user_id := (SELECT id FROM public.user
    WHERE auth_user_id = auth_uid
    LIMIT 1);

    -- check user_id is not null
    IF user_id IS NULL THEN
        RETURN null;
    END IF;

    return user_id;
END;$$ LANGUAGE "plpgsql";

REVOKE ALL ON FUNCTION kit.get_user_id() FROM PUBLIC;
GRANT ALL ON FUNCTION kit.get_user_id() TO service_role, authenticated;

/*
 * [FUNCTION] get_user_email 
 * This function returns the user.email of the current authenticated user.
 */
CREATE OR REPLACE FUNCTION kit.get_user_email() RETURNS varchar(320)
SET search_path = ''
as $$
DECLARE
  auth_uid uuid;
  user_email varchar(320);
BEGIN
    auth_uid := auth.uid();

    -- check user_auth_id is not null
    IF auth_uid IS NULL THEN
        RETURN null;
    END IF;

    user_email := (SELECT email FROM public.user
    WHERE auth_user_id = auth_uid
    LIMIT 1);

    -- check user_email is not null
    IF user_email IS NULL THEN
        RETURN null;
    END IF;

    return user_email;
END;$$ LANGUAGE "plpgsql";

REVOKE ALL ON FUNCTION kit.get_user_email() FROM PUBLIC;
GRANT ALL ON FUNCTION kit.get_user_email() TO service_role, authenticated;

/*
 * [FUNCTION] setup_new_user
 * This function is used to setup a new user after auth.users creation.
 */
CREATE OR REPLACE FUNCTION kit.setup_new_user () RETURNS trigger security definer
SET search_path = ''
as $$
DECLARE
    user_name varchar(255);
    profile_url varchar(1000);
BEGIN
    if new.raw_user_meta_data ->> 'name' is not null then
        user_name := new.raw_user_meta_data ->> 'name';
    end if;

    if user_name is null and new.email is not null then
        user_name := split_part(new.email, '@', 1);
    end if;

    if user_name is null then
        user_name := '';
    end if;

    if new.raw_user_meta_data ->> 'avatar_url' is not null then
        profile_url := new.raw_user_meta_data ->> 'avatar_url';
    else
        profile_url := null;
    end if;

    insert into public.user(
        id,
        auth_user_id,
        name,
        email,
        profile_url,
        completed_onboarding)
    values (
        new.id,
        new.id,
        user_name,
        new.email,
        profile_url,
        false);

    return new;
END;$$ LANGUAGE "plpgsql";

REVOKE ALL ON FUNCTION kit.setup_new_user() FROM PUBLIC;
GRANT ALL ON FUNCTION kit.setup_new_user() TO service_role, authenticated;

/*
 * [FUNCTION] reset_updated_at
 * This function is used to set the updated_at column to the current timestamp.
 */
CREATE OR REPLACE FUNCTION kit.reset_updated_at() RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = "now"();
    RETURN NEW;
END;$$ LANGUAGE "plpgsql";

REVOKE ALL ON FUNCTION kit.reset_updated_at() FROM PUBLIC;
GRANT ALL ON FUNCTION kit.reset_updated_at() TO service_role, authenticated;

 