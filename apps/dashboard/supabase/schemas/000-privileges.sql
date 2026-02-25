/*
 * ---------------------------------------------------------------------------------
 * Database Privileges and Security Setup
 * ---------------------------------------------------------------------------------
 * 
 * Purpose: Configure database-wide security settings and privilege management
 * 
 * Contains:
 * - Public schema privilege revocation for security
 * - Role-based permissions for authenticated and service users
 * - Default privilege settings
 * 
 * Security: Critical for application security - manages access control
 * Dependencies: None (must run first)
 */

------------------------------------- REVOKE ALL PRIVILEGES -------------------------------------

-- Revoke all privileges from public schema to prevent access from public by default
alter default privileges
revoke execute on functions from public;

revoke all on schema public from public;

revoke all PRIVILEGES on database "postgres" from "anon";
revoke all PRIVILEGES on schema "public" from "anon";
revoke all PRIVILEGES on schema "storage" from "anon";
revoke all PRIVILEGES on all SEQUENCES in schema "public" from "anon";
revoke all PRIVILEGES on all SEQUENCES in schema "storage" from "anon";
revoke all PRIVILEGES on all FUNCTIONS in schema "public" from "anon";
revoke all PRIVILEGES on all FUNCTIONS in schema "storage" from "anon";
revoke all PRIVILEGES on all TABLES in schema "public" from "anon";
revoke all PRIVILEGES on all TABLES in schema "storage" from "anon";

alter default privileges in schema public
revoke execute on functions from anon, authenticated;

------------------------------------- GRANT PRIVILEGES -------------------------------------

-- Grant necessary privileges to authenticated, anon and service roles
grant usage on schema public to anon, authenticated;
grant usage on schema public to service_role; 