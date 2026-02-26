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
 * Notification Type ENUM: 
 * The notification_type enum is used to define the type of notification.
 * There are three types of notifications: info, warning, and error.
 */
CREATE TYPE public.notification_type AS ENUM (
    'info',
    'warning',
    'error',
    'success'
);