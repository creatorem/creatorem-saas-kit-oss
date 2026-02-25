/*
 * ---------------------------------------------------------------------------------
 * Usage Record Schema
 * ---------------------------------------------------------------------------------
 *
 * Purpose: Core usage record table, tracking user usage and consumption
 *
 * Table of contents:
 * - Usage record table with basic usage record information
 * - AI usage table for tracking AI model token consumption
 * - Table Comments
 * - Permissions
 * - RLS policies for usage record access control
 */

------------------------------------- USAGE RECORD TABLE -------------------------------------

-- Create usage_records table
CREATE TABLE IF NOT EXISTS "public"."usage_record" (
    id uuid unique not null default extensions.uuid_generate_v4(),
    user_id uuid references public.user (id) on delete cascade not null,
    subscription_id uuid references public.subscription (id) on delete cascade not null,
    tokens_used integer not null,
    action_type text not null, -- 'chat', 'image_generation', etc.
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id)
);

------------------------------------- AI USAGE TABLE -------------------------------------

/*
 * AI USAGE TABLE:
 * This table tracks AI model token consumption per user interaction.
 */
CREATE TABLE IF NOT EXISTS "public"."ai_usage" (
    id uuid unique not null default extensions.uuid_generate_v4(),
    user_id uuid references public.user (id) on delete cascade not null,
    input_tokens integer not null default 0,
    output_tokens integer not null default 0,
    reasoning_tokens integer not null default 0,
    cached_input_tokens integer not null default 0,
    model_id text not null,
    cost numeric(10, 6) not null default 0,
    ai_timestamp timestamptz not null,
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id)
);

------------------------------------- TABLE COMMENTS -------------------------------------

COMMENT ON TABLE "public"."usage_record" IS 'Allow to store usage records';
COMMENT ON TABLE "public"."ai_usage" IS 'Tracks AI model token consumption and usage metrics per user';
COMMENT ON COLUMN "public"."ai_usage"."input_tokens" IS 'Number of input tokens consumed';
COMMENT ON COLUMN "public"."ai_usage"."output_tokens" IS 'Number of output tokens generated';
COMMENT ON COLUMN "public"."ai_usage"."reasoning_tokens" IS 'Number of reasoning tokens used (if applicable)';
COMMENT ON COLUMN "public"."ai_usage"."cached_input_tokens" IS 'Number of cached input tokens used';
COMMENT ON COLUMN "public"."ai_usage"."model_id" IS 'AI model identifier used for this request';
COMMENT ON COLUMN "public"."ai_usage"."cost" IS 'Pre-calculated cost in billing currency based on token usage and model pricing';
COMMENT ON COLUMN "public"."ai_usage"."ai_timestamp" IS 'Timestamp from the AI model response';
COMMENT ON COLUMN "public"."usage_record"."user_id" IS 'The user id of the usage record';
COMMENT ON COLUMN "public"."usage_record"."subscription_id" IS 'The subscription id of the usage record';
COMMENT ON COLUMN "public"."usage_record"."tokens_used" IS 'The number of tokens used';
COMMENT ON COLUMN "public"."usage_record"."action_type" IS 'The type of action performed';
COMMENT ON COLUMN "public"."usage_record"."updated_at" IS 'The last time the usage record was updated';
COMMENT ON COLUMN "public"."usage_record"."created_at" IS 'The time the usage record was created';

------------------------------------- PERMISSIONS -------------------------------------

REVOKE all on public.usage_record from authenticated, service_role;
GRANT select, insert, update, delete on table public.usage_record to authenticated, service_role;

REVOKE all on public.ai_usage from authenticated, service_role;
GRANT select, insert, update, delete on table public.ai_usage to authenticated, service_role;

-- Enable RLS on the usage_record table
ALTER TABLE public.usage_record ENABLE ROW LEVEL SECURITY;

-- Enable RLS on the ai_usage table
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

------------------------------------- RLS POLICIES -------------------------------------

/*
 * Usage record policy
 * Users can only access usage records that belong to them through user_id relationship
 */
CREATE POLICY usage_record_all ON public.usage_record
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user
        WHERE ((public.user.id = usage_record.user_id) AND (public.user.auth_user_id = auth.uid()))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user
        WHERE ((public.user.id = usage_record.user_id) AND (public.user.auth_user_id = auth.uid()))
    )
);

/*
 * AI usage policy
 * Users can only access AI usage records that belong to them through user_id relationship
 */
CREATE POLICY ai_usage_all ON public.ai_usage
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user
        WHERE ((public.user.id = ai_usage.user_id) AND (public.user.auth_user_id = auth.uid()))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user
        WHERE ((public.user.id = ai_usage.user_id) AND (public.user.auth_user_id = auth.uid()))
    )
);
