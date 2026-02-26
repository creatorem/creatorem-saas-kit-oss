/*
 * ---------------------------------------------------------------------------------
 * Subscription Schema
 * ---------------------------------------------------------------------------------
 * 
 * Purpose: Core subscription table, membership management, and organizational structure
 * 
 * Contains:
 * - Subscription table with basic subscription information
 * - RLS policies for subscription access control
 */

------------------------------------- SUBSCRIPTION TABLE -------------------------------------

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS "public"."subscription" (
    id uuid unique not null default extensions.uuid_generate_v4(),
    user_id uuid references public.user (id) on delete cascade not null,
    stripe_subscription_id text unique not null,
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id)
);

------------------------------------- TABLE COMMENTS -------------------------------------

COMMENT ON TABLE "public"."subscription" IS 'Allow to store subscriptions';
COMMENT ON COLUMN "public"."subscription"."user_id" IS 'The user id of the subscription';
COMMENT ON COLUMN "public"."subscription"."stripe_subscription_id" IS 'The stripe subscription id of the subscription';
COMMENT ON COLUMN "public"."subscription"."updated_at" IS 'The last time the subscription was updated';
COMMENT ON COLUMN "public"."subscription"."created_at" IS 'The time the subscription was created';

------------------------------------- PERMISSIONS -------------------------------------

REVOKE all on public.subscription from authenticated, service_role;
GRANT select, insert, update, delete on table public.subscription to authenticated, service_role;

-- Enable RLS on the subscription table
ALTER TABLE public.subscription ENABLE ROW LEVEL SECURITY;

------------------------------------- RLS POLICIES -------------------------------------

/*
 * User settings policy
 * Users can only access settings that belong to them through user_id relationship
 */
CREATE POLICY subscription_all ON public.subscription
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user
        WHERE ((public.user.id = subscription.user_id) AND (public.user.auth_user_id = auth.uid()))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user
        WHERE ((public.user.id = subscription.user_id) AND (public.user.auth_user_id = auth.uid()))
    )
);
