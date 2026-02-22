/*
 * ---------------------------------------------------------------------------------
 * Custom Enum Types
 * ---------------------------------------------------------------------------------
 * 
 * Purpose: Define all custom PostgreSQL enum types used across the application
 * 
 * Contains:
 * - Notification types and channels
 * - Organization permissions and roles
 * - Status and classification enums
 * 
 * Dependencies: None (types are fundamental)
 * Used by: All tables that reference these enum types
 */

/*
 * Organization Permissions ENUM: 
 * These permissions are used to manage the permissions for the public.organization_member table
 * Add more permissions as needed.
 */
CREATE TYPE public.org_permission as enum(
  'role.manage',
  'organization.manage',
  'member.manage',
  'invitation.manage',
  'setting.manage',
  'media.manage'
);
