/*
 * ---------------------------------------------------------------------------------
 * Session Management Schema
 * ---------------------------------------------------------------------------------
 * 
 * Purpose: User session management and authentication tracking
 * 
 * Contains:
 * - Session viewing and listing functions
 * - Session revocation and management utilities
 * - Session detail tracking (user agents, IP addresses)
 * - Debug utilities for session troubleshooting
 * 
 * Dependencies: Auth schema (Supabase built-in)
 * Used by: Session management UI, proxy session tracking, security features
 */

------------------------------------- SESSION VIEWING FUNCTIONS -------------------------------------

/*
 * [FUNCTION] get_user_sessions
 * This function returns all sessions for the current authenticated user.
 */
CREATE OR REPLACE FUNCTION kit.get_user_sessions() 
RETURNS TABLE (
    id uuid,
    user_id uuid,
    created_at timestamptz,
    updated_at timestamptz,
    factor_id uuid,
    aal text,
    not_after timestamptz,
    user_agent text,
    ip inet
) 
SECURITY DEFINER 
SET search_path = ''
as $$
DECLARE
    auth_uid uuid;
BEGIN
    auth_uid := auth.uid();

    -- check user_auth_id is not null
    IF auth_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    RETURN QUERY
    SELECT 
        s.id,
        s.user_id,
        s.created_at,
        s.updated_at,
        s.factor_id,
        s.aal::text, -- Cast aal_level enum to text
        s.not_after,
        s.user_agent,
        s.ip
    FROM auth.sessions s
    WHERE s.user_id = auth_uid
    ORDER BY s.updated_at DESC;
END;$$ LANGUAGE "plpgsql";

REVOKE ALL ON FUNCTION kit.get_user_sessions() FROM PUBLIC;
GRANT ALL ON FUNCTION kit.get_user_sessions() TO service_role, authenticated;

------------------------------------- SESSION REVOCATION FUNCTIONS -------------------------------------

/*
 * [FUNCTION] revoke_user_session
 * This function revokes a specific session for the current authenticated user.
 */
CREATE OR REPLACE FUNCTION kit.revoke_user_session(session_id uuid) 
RETURNS boolean
SECURITY DEFINER 
SET search_path = ''
as $$
DECLARE
    auth_uid uuid;
    session_exists boolean;
BEGIN
    auth_uid := auth.uid();

    -- check user_auth_id is not null
    IF auth_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Check if the session being revoked belongs to current user and delete it
    DELETE FROM auth.sessions 
    WHERE id = session_id AND user_id = auth_uid;

    -- Return true if a row was deleted, false if session wasn't found
    RETURN FOUND;
END;$$ LANGUAGE "plpgsql";

REVOKE ALL ON FUNCTION kit.revoke_user_session(uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION kit.revoke_user_session(uuid) TO service_role, authenticated;

/*
 * [FUNCTION] revoke_all_other_sessions
 * This function revokes all sessions except the one being used to make this call.
 * We'll keep the most recently updated session as a safety measure.
 */
CREATE OR REPLACE FUNCTION kit.revoke_all_other_sessions() 
RETURNS integer
SECURITY DEFINER 
SET search_path = ''
as $$
DECLARE
    auth_uid uuid;
    revoked_count integer;
    keep_session_id uuid;
BEGIN
    auth_uid := auth.uid();

    -- check user_auth_id is not null
    IF auth_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Find the most recently updated session to keep (likely the current one)
    SELECT s.id INTO keep_session_id
    FROM auth.sessions s
    WHERE s.user_id = auth_uid
    ORDER BY s.updated_at DESC
    LIMIT 1;

    -- Revoke all sessions except the most recent one
    IF keep_session_id IS NOT NULL THEN
        DELETE FROM auth.sessions 
        WHERE user_id = auth_uid 
        AND id != keep_session_id;
    ELSE
        -- If no sessions found, nothing to revoke
        revoked_count := 0;
        RETURN revoked_count;
    END IF;

    GET DIAGNOSTICS revoked_count = ROW_COUNT;

    RETURN revoked_count;
END;$$ LANGUAGE "plpgsql";

REVOKE ALL ON FUNCTION kit.revoke_all_other_sessions() FROM PUBLIC;
GRANT ALL ON FUNCTION kit.revoke_all_other_sessions() TO service_role, authenticated;

------------------------------------- SESSION TRACKING FUNCTIONS -------------------------------------

/*
 * [FUNCTION] update_session_details
 * This function updates session details like user_agent and IP for the current session.
 * It's designed to be called from proxy to keep session info up to date.
 */
CREATE OR REPLACE FUNCTION kit.update_session_details(
    session_id uuid,
    new_user_agent text DEFAULT NULL,
    new_ip inet DEFAULT NULL
)
RETURNS boolean
SECURITY DEFINER 
SET search_path = ''
as $$
DECLARE
    auth_uid uuid;
    rows_affected integer;
    should_update_ip boolean := false;
BEGIN
    auth_uid := auth.uid();

    -- check user_auth_id is not null
    IF auth_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Determine if we should update the IP
    -- Only update IP if the new value is meaningful (not localhost, not empty)
    IF new_ip IS NOT NULL THEN
        should_update_ip := NOT (
            new_ip = '127.0.0.1'::inet OR 
            new_ip = '::1'::inet OR 
            new_ip = '0.0.0.0'::inet OR
            new_ip = '::'::inet
        );
    END IF;

    -- Check if the session belongs to current user and update it
    UPDATE auth.sessions 
    SET 
        user_agent = COALESCE(new_user_agent, user_agent),
        ip = CASE 
            WHEN should_update_ip THEN new_ip 
            ELSE ip 
        END,
        updated_at = NOW()
    WHERE id = session_id AND user_id = auth_uid;

    -- Return true if a row was updated, false if session wasn't found
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RETURN rows_affected > 0;
END;$$ LANGUAGE "plpgsql";

REVOKE ALL ON FUNCTION kit.update_session_details(uuid, text, inet) FROM PUBLIC;
GRANT ALL ON FUNCTION kit.update_session_details(uuid, text, inet) TO service_role, authenticated;

------------------------------------- SESSION DEBUG FUNCTIONS -------------------------------------

/*
 * [DEBUG FUNCTION] debug_jwt_info
 * This function helps debug JWT content and session detection
 */
CREATE OR REPLACE FUNCTION kit.debug_jwt_info()
RETURNS TABLE (
    auth_user_id uuid,
    jwt_session_id text,
    jwt_sid text,
    jwt_full json,
    detected_current_session uuid,
    total_user_sessions integer
)
SECURITY DEFINER 
SET search_path = ''
as $$
DECLARE
    auth_uid uuid;
    jwt_payload json;
    current_session_id uuid;
    session_count integer;
BEGIN
    auth_uid := auth.uid();
    jwt_payload := auth.jwt();
    
    -- Try to detect current session ID
    current_session_id := (jwt_payload ->> 'session_id')::uuid;
    IF current_session_id IS NULL THEN
        current_session_id := (jwt_payload ->> 'sid')::uuid;
    END IF;
    IF current_session_id IS NULL THEN
        SELECT s.id INTO current_session_id
        FROM auth.sessions s
        WHERE s.user_id = auth_uid
        ORDER BY s.updated_at DESC
        LIMIT 1;
    END IF;
    
    -- Count user sessions
    SELECT COUNT(*) INTO session_count
    FROM auth.sessions s
    WHERE s.user_id = auth_uid;
    
    -- Return debug info
    auth_user_id := auth_uid;
    jwt_session_id := jwt_payload ->> 'session_id';
    jwt_sid := jwt_payload ->> 'sid';
    jwt_full := jwt_payload;
    detected_current_session := current_session_id;
    total_user_sessions := session_count;
    
    RETURN NEXT;
END;$$ LANGUAGE "plpgsql";

REVOKE ALL ON FUNCTION kit.debug_jwt_info() FROM PUBLIC;
GRANT ALL ON FUNCTION kit.debug_jwt_info() TO service_role, authenticated; 