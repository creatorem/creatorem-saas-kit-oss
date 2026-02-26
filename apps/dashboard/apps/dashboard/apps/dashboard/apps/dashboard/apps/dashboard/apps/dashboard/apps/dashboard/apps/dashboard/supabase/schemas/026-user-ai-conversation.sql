/*
 * ---------------------------------------------------------------------------------
 * AI Conversation Schema
 * ---------------------------------------------------------------------------------
 * 
 * Purpose: Store AI chat threads and messages
 */

 /*
 * Notification Type ENUM: 
 * The notification_type enum is used to define the type of notification.
 * There are three types of notifications: info, warning, and error.
 */
CREATE TYPE public.ai_thread_status AS ENUM (
    'regular',
    'archived'
);

------------------------------------- AI THREAD TABLE -------------------------------------

-- Create ai_thread table for storing chat threads per user
CREATE TABLE IF NOT EXISTS "public"."ai_thread" (
    id uuid unique not null default extensions.uuid_generate_v4(),
    user_id uuid references public.user (id) on delete cascade not null,
    title text,
    status public.ai_thread_status DEFAULT 'regular'::public.ai_thread_status NOT NULL,
    external_id text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id)
);

------------------------------------- TABLE COMMENTS -------------------------------------

COMMENT ON TABLE "public"."ai_thread" IS 'Stores assistant chat threads owned by a user';
COMMENT ON COLUMN "public"."ai_thread"."user_id" IS 'Owner of the thread';
COMMENT ON COLUMN "public"."ai_thread"."title" IS 'The title of the thread';
COMMENT ON COLUMN "public"."ai_thread"."metadata" IS 'The metadata of the thread';
COMMENT ON COLUMN "public"."ai_thread"."updated_at" IS 'The last time the thread was updated';
COMMENT ON COLUMN "public"."ai_thread"."created_at" IS 'The time the thread was created';

------------------------------------- PERMISSIONS -------------------------------------

REVOKE all on public.ai_thread from authenticated, service_role;
GRANT select, insert, update, delete on table public.ai_thread to authenticated, service_role;

-- Enable RLS on the ai_thread table
ALTER TABLE public.ai_thread ENABLE ROW LEVEL SECURITY;

------------------------------------- RLS POLICIES -------------------------------------

-- Users can manage only their own threads
CREATE POLICY ai_thread_all ON public.ai_thread
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user
        WHERE (public.user.id = ai_thread.user_id) AND (public.user.auth_user_id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user
        WHERE (public.user.id = ai_thread.user_id) AND (public.user.auth_user_id = auth.uid())
    )
);

------------------------------------- AI MESSAGE TABLE -------------------------------------

-- Create ai_message table for storing messages within a thread
CREATE TABLE IF NOT EXISTS "public"."ai_message" (
    id uuid unique not null default extensions.uuid_generate_v4(),
    user_id uuid references public.user (id) on delete cascade not null,
    thread_id uuid REFERENCES public.ai_thread (id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('user', 'assistant', 'tool', 'system')),
    content text NOT NULL,
    tool_name text,
    tool_input jsonb,
    tokens_used integer,
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id)
);

------------------------------------- TABLE COMMENTS -------------------------------------

COMMENT ON TABLE "public"."ai_message" IS 'Stores messages within AI chat threads';
COMMENT ON COLUMN "public"."ai_message"."role" IS 'Message role: user, assistant, tool, system';

------------------------------------- PERMISSIONS -------------------------------------

REVOKE all on public.ai_message from authenticated, service_role;
GRANT select, insert, update, delete on table public.ai_message to authenticated, service_role;

-- Enable RLS on the usage_record table
ALTER TABLE public.ai_message ENABLE ROW LEVEL SECURITY;

------------------------------------- RLS POLICIES -------------------------------------

-- Messages are accessible if they belong to a thread owned by the current user
CREATE POLICY ai_message_all ON public.ai_message
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.ai_thread t
        JOIN public.user u ON (u.id = t.user_id)
        WHERE t.id = ai_message.thread_id AND u.auth_user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.ai_thread t
        JOIN public.user u ON (u.id = t.user_id)
        WHERE t.id = ai_message.thread_id AND u.auth_user_id = auth.uid()
    )
);
