/*
 * ---------------------------------------------------------------------------------
 * Kit Organization Utilities
 * ---------------------------------------------------------------------------------
 * 
 * Purpose: Organization-specific utility functions and business logic
 * 
 * Contains:
 * - Organization permission checking functions
 * - Role hierarchy and membership utilities
 * - Owner and member verification functions
 * - Invitation handling utilities
 * 
 * Dependencies: Kit schema (001-kit.sql), organization enums (010-enums.sql)
 * Used by: Organization schema and all organization-related operations
 */

------------------------------------- ORGANIZATION SETUP FUNCTIONS -------------------------------------

/*
 * [FUNCTION] set_owner_organization_role
 * This function is used to setup a new organization role after organization creation.
 * Automatically assigns the creator as owner with editor role.
 */
CREATE OR REPLACE FUNCTION kit.set_owner_organization_role() RETURNS trigger security definer
SET search_path = ''
as $$
DECLARE
    editor_role_id uuid;
BEGIN
    -- Get the editor role ID for the new organization
    SELECT id INTO editor_role_id
    FROM public.organization_role
    WHERE name = 'editor' AND organization_id = NEW.id;
    
    -- Insert the owner membership with editor role
    INSERT INTO public.organization_member(
        is_owner,
        role_id,
        user_id,
        organization_id)
    VALUES (
        true,
        editor_role_id,
        kit.get_user_id(),
        NEW.id);

    RETURN NEW;
END;$$ LANGUAGE "plpgsql";

------------------------------------- ROLE AND PERMISSION FUNCTIONS -------------------------------------

/*
 * [FUNCTION] user_org_role_is_higher_than
 * This function returns true if the current user has a higher role than the given role on the given organization.
 */
CREATE OR REPLACE FUNCTION kit.user_org_role_is_higher_than(org_id uuid, target_user_id uuid) RETURNS boolean
SET search_path = ''
as $$
DECLARE
  current_user_id uuid;
  current_role_id uuid;
  current_is_owner boolean;
  current_hierarchy_level integer;
  target_role_id uuid;
  target_is_owner boolean;
  target_hierarchy_level integer;
BEGIN
  current_user_id := kit.get_user_id();

  -- check current user_id is not null
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Get current user's role and ownership status
  SELECT role_id, is_owner
  INTO current_role_id, current_is_owner
  FROM public.organization_member
  WHERE user_id = current_user_id 
    AND organization_id = org_id;

  -- If current user is not a member, return false
  IF current_role_id IS NULL THEN
    RETURN false;
  END IF;

  -- Get target user's role and ownership status
  SELECT role_id, is_owner
  INTO target_role_id, target_is_owner
  FROM public.organization_member
  WHERE user_id = target_user_id 
    AND organization_id = org_id;

  -- If target user is not a member, return false
  IF target_role_id IS NULL THEN
    RETURN false;
  END IF;

  -- Get hierarchy levels for both roles
  SELECT hierarchy_level INTO current_hierarchy_level
  FROM public.organization_role
  WHERE id = current_role_id;

  SELECT hierarchy_level INTO target_hierarchy_level
  FROM public.organization_role
  WHERE id = target_role_id;

  -- Compare hierarchy levels first
  IF current_hierarchy_level < target_hierarchy_level THEN
    RETURN true;
  END IF;

  -- If roles are equal, check ownership (only matters for editor role)
  IF current_hierarchy_level = target_hierarchy_level THEN
    -- Current user has higher authority if they are owner and target is not
    RETURN current_is_owner = true AND target_is_owner = false;
  END IF;

  -- In all other cases, current user does not have higher role
  RETURN false;
END;$$ LANGUAGE "plpgsql";

REVOKE ALL ON FUNCTION kit.user_org_role_is_higher_than(uuid, uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION kit.user_org_role_is_higher_than(uuid, uuid) TO service_role, authenticated;

/*
 * [FUNCTION] has_org_permission
 * This function returns true if the current user has the given permission on the given organization.
 * Use security definer to by pass row level security as this function is one of the most used in the row level security (avoid infinite loop)
 */
CREATE OR REPLACE FUNCTION kit.has_org_permission(org_id uuid, permission_name org_permission) RETURNS boolean 
SECURITY DEFINER
SET search_path = ''
as $$
DECLARE
  local_user_id uuid;
BEGIN
  local_user_id := kit.get_user_id();

  -- check user_id is not null
  IF local_user_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 
    FROM public.organization_member
    JOIN public.organization_role 
      ON public.organization_role.id = public.organization_member.role_id
    JOIN public.organization_role_permission 
      ON public.organization_role_permission.role_id = public.organization_role.id
    WHERE public.organization_member.user_id = local_user_id 
      AND public.organization_member.organization_id = org_id 
      AND public.organization_role.organization_id = org_id
      AND public.organization_role_permission.permission = permission_name
  );
END;$$ LANGUAGE "plpgsql";

REVOKE ALL ON FUNCTION kit.has_org_permission(uuid, org_permission) FROM PUBLIC;
GRANT ALL ON FUNCTION kit.has_org_permission(uuid, org_permission) TO service_role, authenticated;

/*
 * Function: Check if multiple roles have role.manage permission
 * Returns true if more than one role in the organization has the role.manage permission
 * This ensures we don't remove role.manage from the last role that has it
 * Returns false if only one or zero roles have the permission
 * Used before removing role.manage permission from a role
 */
CREATE OR REPLACE FUNCTION kit.has_multiple_role_manage_permissions(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    role_manage_count integer;
BEGIN
    -- Count how many roles in the organization have the role.manage permission
    SELECT COUNT(DISTINCT orp.role_id)
    INTO role_manage_count
    FROM public.organization_role_permission orp
    JOIN public.organization_role r ON r.id = orp.role_id
    WHERE orp.organization_id = org_id
      AND orp.permission = 'role.manage'
      AND r.organization_id = org_id;

    -- Return true if there's more than one role with role.manage
    RETURN role_manage_count > 1;
END;
$$;

COMMENT ON FUNCTION kit.has_multiple_role_manage_permissions(uuid) IS
'Checks if more than one role in an organization has the role.manage permission. Used to prevent removing role.manage from the last role that has it.';

------------------------------------- MEMBERSHIP FUNCTIONS -------------------------------------

/*
 * [FUNCTION] user_is_member_of_org
 * This function returns true if the current user is a member of the given organization.
 */
CREATE OR REPLACE FUNCTION kit.user_is_member_of_org(org_id uuid) RETURNS boolean
SET search_path = ''
as $$
DECLARE
  local_user_id uuid;
BEGIN
  local_user_id := kit.get_user_id();

  -- check user_id is not null
  IF local_user_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.organization_member
    WHERE 
      organization_member.organization_id = org_id AND
      organization_member.user_id = local_user_id
  );
END;$$ LANGUAGE "plpgsql";

REVOKE ALL ON FUNCTION kit.user_is_member_of_org(uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION kit.user_is_member_of_org(uuid) TO service_role, authenticated;

/*
 * [FUNCTION] user_is_owner_of_org
 * This function returns true if the current user is the owner of the given organization.
 */
CREATE OR REPLACE FUNCTION kit.user_is_owner_of_org(org_id uuid) RETURNS boolean
SET search_path = ''
as $$
DECLARE
  local_user_id uuid;
BEGIN
  local_user_id := kit.get_user_id();

  -- check user_id is not null
  IF local_user_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.organization_member
    WHERE 
      organization_member.organization_id = org_id AND
      organization_member.user_id = local_user_id AND
      organization_member.is_owner = true
  );
END;$$ LANGUAGE "plpgsql";

REVOKE ALL ON FUNCTION kit.user_is_owner_of_org(uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION kit.user_is_owner_of_org(uuid) TO service_role, authenticated;

------------------------------------- INVITATION FUNCTIONS -------------------------------------

/*
 * [FUNCTION] accept_invitation
 * This function is used to accept an invitation to an organization.
 * Returns different status codes for different scenarios:
 * - 'success': Successfully accepted invitation
 * - 'expired': Invitation has expired or doesn't exist
 * - 'wrong_email': User email doesn't match invitation email
 * - 'already_member': User is already a member of the organization
 */
CREATE OR REPLACE FUNCTION kit.accept_invitation (invitation_id uuid)
RETURNS TEXT
SET search_path = ''
as $$
DECLARE
    local_user_id uuid;
    org_id uuid;
    user_role_id uuid;
    invitation_email text;
    user_email VARCHAR(320);
BEGIN
    -- Get user email
    user_email := kit.get_user_email();
    local_user_id := kit.get_user_id();

    IF user_email IS NULL OR local_user_id is NULL THEN
        RAISE EXCEPTION 'User not found or email missing';
    END IF;

    -- Get invitation details
    SELECT
        organization_id,
        role_id,
        email
    INTO
        org_id,
        user_role_id,
        invitation_email
    FROM
        public.organization_invitation
    WHERE
        id = accept_invitation.invitation_id AND
        email = user_email;

    -- Check if invitation exists
    IF org_id IS NULL OR user_role_id IS NULL OR invitation_email IS NULL THEN
        RETURN 'wrong_invitation';
    END IF;

    -- Check if invitation has expired
    IF EXISTS (
        SELECT 1
        FROM public.organization_invitation
        WHERE id = accept_invitation.invitation_id
        AND expires_at IS NOT NULL
        AND expires_at < NOW()
    ) THEN
        -- Delete expired invitation
        DELETE FROM public.organization_invitation
        WHERE id = accept_invitation.invitation_id;
        
        RETURN 'expired';
    END IF;

    -- Check if user is already a member and update/insert accordingly
    IF EXISTS (
        SELECT 1
        FROM public.organization_member
        WHERE user_id = local_user_id 
        AND organization_id = org_id
    ) THEN
        -- Update existing membership with new role
        UPDATE public.organization_member
        SET 
            role_id = user_role_id,
            updated_at = NOW()
        WHERE user_id = local_user_id 
        AND organization_id = org_id;
    ELSE
        -- Insert new membership
        INSERT INTO public.organization_member(
            user_id,
            organization_id,
            role_id,
            is_owner)
        VALUES (
            local_user_id,
            org_id,
            user_role_id,
            false);
    END IF;

    -- Delete the invitation
    DELETE FROM public.organization_invitation
    WHERE id = accept_invitation.invitation_id;

    RETURN 'success';
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION kit.accept_invitation(uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION kit.accept_invitation(uuid) TO service_role, authenticated;

/*
 * [FUNCTION] user_is_invited_to_org 
 * This function returns true if the current user is invited to the given organization.
 */
CREATE OR REPLACE FUNCTION kit.user_is_invited_to_org(org_id uuid) RETURNS boolean
SET search_path = ''
as $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.organization_invitation
    WHERE organization_id = org_id AND email ilike kit.get_user_email() AND expires_at > now()
  );
END;$$ LANGUAGE "plpgsql";

REVOKE ALL ON FUNCTION kit.user_is_invited_to_org(uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION kit.user_is_invited_to_org(uuid) TO service_role, authenticated;



/*
 * [FUNCTION] handle_duplicate_invitation
 * This function handles duplicate invitation scenarios by updating existing invitations.
 */
CREATE OR REPLACE FUNCTION kit.handle_duplicate_invitation()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
    -- If an invitation already exists for this email and organization, update it
    UPDATE public.organization_invitation 
    SET 
        invite_token = NEW.invite_token,
        role_id = NEW.role_id,
        expires_at = NEW.expires_at,
        updated_at = NOW()
    WHERE email = NEW.email 
    AND organization_id = NEW.organization_id;
    
    -- If a row was updated, don't insert the new one
    IF FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Otherwise, allow the insert to proceed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION kit.handle_duplicate_invitation() FROM PUBLIC;
GRANT ALL ON FUNCTION kit.handle_duplicate_invitation() TO service_role, authenticated;

------------------------------------- PUBLIC WRAPPER FUNCTIONS -------------------------------------

/*
 * [FUNCTION] user_org_role_is_higher_than (public wrapper)
 * Public wrapper function for kit.user_org_role_is_higher_than to make it accessible via PostgREST
 */
CREATE OR REPLACE FUNCTION public.user_org_role_is_higher_than(org_id uuid, target_user_id uuid) 
RETURNS boolean
SET search_path = ''
AS $$
BEGIN
    RETURN kit.user_org_role_is_higher_than(org_id, target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.user_org_role_is_higher_than(uuid, uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.user_org_role_is_higher_than(uuid, uuid) TO anon, service_role, authenticated;