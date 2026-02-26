/*
 * ---------------------------------------------------------------------------------
 * Notifications Schema
 * ---------------------------------------------------------------------------------
 *
 * Purpose: User notification system with platform-specific push notification support
 *
 * Contains:
 * - Notification table with dismissal tracking
 * - Platform-specific fields for iOS and Android
 * - Flexible data storage for notification metadata
 * - RLS policies for user-specific notification access
 * - Automatic timestamp triggers
 *
 * Dependencies: User table (021-user.sql)
 * Used by: Notification system, push notifications, and user communication features
 */

------------------------------------- NOTIFICATION TABLE -------------------------------------

/*
 * Notification TABLE:
 * This table contains user notification data.
 * Supports platform-specific push notifications for iOS and Android.
 * Includes dismissal tracking and flexible metadata storage.
 */
CREATE TABLE IF NOT EXISTS "public"."notification" (
    id uuid unique not null default extensions.uuid_generate_v4(),
    user_id uuid references public.user (id) on delete cascade not null,
    type public.notification_type DEFAULT 'info'::public.notification_type NOT NULL,
    image_url varchar(1000),
    icon varchar(320),
    read boolean DEFAULT false NOT NULL,
    title varchar(320) NOT NULL,
    body character varying NOT NULL,
    data jsonb,
    ios_subtitle varchar(320),
    ios_badge_count integer,
    ios_sound_name varchar(320),
    android_channel_id varchar(320),
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id)
);

------------------------------------- TABLE COMMENTS -------------------------------------

COMMENT ON TABLE "public"."notification" IS 'Store notifications for users with platform-specific push notification support';
COMMENT ON COLUMN "public"."notification"."user_id" IS 'The user id of the notification';
COMMENT ON COLUMN "public"."notification"."read" IS 'Whether the notification has been read by the user';
COMMENT ON COLUMN "public"."notification"."title" IS 'The title of the notification';
COMMENT ON COLUMN "public"."notification"."body" IS 'The body content of the notification';
COMMENT ON COLUMN "public"."notification"."data" IS 'Additional structured data for the notification in JSON format';
COMMENT ON COLUMN "public"."notification"."ios_subtitle" IS 'iOS-specific subtitle displayed below the title';
COMMENT ON COLUMN "public"."notification"."ios_badge_count" IS 'iOS-specific badge count to display on the app icon';
COMMENT ON COLUMN "public"."notification"."ios_sound_name" IS 'iOS-specific sound name to play when notification is received';
COMMENT ON COLUMN "public"."notification"."android_channel_id" IS 'Android-specific notification channel ID for categorization';
COMMENT ON COLUMN "public"."notification"."updated_at" IS 'The last update date of the notification';
COMMENT ON COLUMN "public"."notification"."created_at" IS 'The creation date of the notification';

------------------------------------- PERMISSIONS -------------------------------------

-- Reset the RLS access to authenticated and service_role roles
REVOKE all on public.notification from authenticated, service_role;
GRANT select, insert, update, delete on table public.notification to authenticated, service_role;

-- Enable RLS on the notification table
ALTER TABLE public.notification ENABLE ROW LEVEL SECURITY;

------------------------------------- RLS POLICIES -------------------------------------

/*
 * Notification policy
 * Users can only access notifications that belong to them through user_id relationship
 */
CREATE POLICY notification_all ON public.notification
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user
        WHERE ((public.user.id = notification.user_id) AND (public.user.auth_user_id = auth.uid()))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user
        WHERE ((public.user.id = notification.user_id) AND (public.user.auth_user_id = auth.uid()))
    )
);

------------------------------------- TRIGGERS -------------------------------------

/*
 * Trigger: Update timestamp on notification changes
 * Automatically updates updated_at field when notification is modified
 */
create trigger reset_updated_at_on_notification_on_update
after update on public.notification for each row
execute procedure kit.reset_updated_at (); 