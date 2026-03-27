-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."ai_thread_status" AS ENUM('regular', 'archived');--> statement-breakpoint
CREATE TYPE "public"."booking_state" AS ENUM('requires_payment_method', 'requires_slot_confirmation', 'canceled', 'confirmed', 'charged', 'confirmation_failed');--> statement-breakpoint
CREATE TYPE "public"."content_state" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."frequency_type" AS ENUM('once', 'day', 'week', 'month', 'year');--> statement-breakpoint
CREATE TYPE "public"."matrix_axis" AS ENUM('row', 'col');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('info', 'warning', 'error', 'success');--> statement-breakpoint
CREATE TYPE "public"."org_permission" AS ENUM('organization.manage', 'member.manage', 'setting.manage', 'media.manage');--> statement-breakpoint
CREATE TYPE "public"."slot_state" AS ENUM('confirmed', 'requested');--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT auth.uid() NOT NULL,
	"auth_user_id" uuid DEFAULT auth.uid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320),
	"profile_url" varchar(1000),
	"phone" varchar,
	"completed_onboarding" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_setting" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"value" json DEFAULT '{"json":null}'::json NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_setting" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"stripe_subscription_id" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_stripe_subscription_id_key" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "subscription" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ai_thread" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text,
	"status" "ai_thread_status" DEFAULT 'regular' NOT NULL,
	"external_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_thread" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ai_message" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"thread_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"tool_name" text,
	"tool_input" jsonb,
	"tokens_used" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_message_role_check" CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text, 'tool'::text, 'system'::text]))
);
--> statement-breakpoint
ALTER TABLE "ai_message" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "usage_record" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" uuid NOT NULL,
	"tokens_used" integer NOT NULL,
	"action_type" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "usage_record" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"reasoning_tokens" integer DEFAULT 0 NOT NULL,
	"cached_input_tokens" integer DEFAULT 0 NOT NULL,
	"model_id" text NOT NULL,
	"cost" numeric(10, 6) DEFAULT '0' NOT NULL,
	"ai_timestamp" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_usage" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ai_wallet" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"balance" numeric(10, 6) DEFAULT '0' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_wallet_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "ai_wallet" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ai_wallet_transaction" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"amount" numeric(10, 6) NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text,
	"balance_after" numeric(10, 6) NOT NULL,
	"metadata" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_wallet_transaction_type_check" CHECK ((type)::text = ANY ((ARRAY['deposit'::character varying, 'usage'::character varying, 'refund'::character varying, 'adjustment'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "ai_wallet_transaction" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organization" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" text NOT NULL,
	"address" varchar,
	"email" varchar(320),
	"website" varchar(320),
	"logo_url" varchar(1000),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_slug_key" UNIQUE("slug"),
	CONSTRAINT "organization_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "organization" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organization_role" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" varchar(100) NOT NULL,
	"hierarchy_level" integer NOT NULL,
	"organization_id" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_role_name_organization_id_key" UNIQUE("name","organization_id")
);
--> statement-breakpoint
ALTER TABLE "organization_role" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organization_role_permission" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"role_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"permission" "org_permission" NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_role_permission_role_id_permission_key" UNIQUE("role_id","permission")
);
--> statement-breakpoint
ALTER TABLE "organization_role_permission" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organization_member" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"is_owner" boolean DEFAULT false NOT NULL,
	"role_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_member_user_id_organization_id_key" UNIQUE("user_id","organization_id")
);
--> statement-breakpoint
ALTER TABLE "organization_member" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organization_invitation" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"email" varchar(320) NOT NULL,
	"organization_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"invite_token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"invited_by" uuid DEFAULT auth.uid() NOT NULL,
	"expires_at" timestamp DEFAULT (now() + '7 days'::interval) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_invitation_email_organization_id_key" UNIQUE("email","organization_id"),
	CONSTRAINT "organization_invitation_invite_token_key" UNIQUE("invite_token")
);
--> statement-breakpoint
ALTER TABLE "organization_invitation" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organization_setting" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"value" json DEFAULT '{"json":null}'::json NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_setting" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" DEFAULT 'info' NOT NULL,
	"image_url" varchar(1000),
	"icon" varchar(320),
	"read" boolean DEFAULT false NOT NULL,
	"title" varchar(320) NOT NULL,
	"body" varchar NOT NULL,
	"data" jsonb,
	"ios_subtitle" varchar(320),
	"ios_badge_count" integer,
	"ios_sound_name" varchar(320),
	"android_channel_id" varchar(320),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid
);
--> statement-breakpoint
ALTER TABLE "notification" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "service" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"images" jsonb,
	"location" varchar(255),
	"min_participant" integer NOT NULL,
	"max_participant" integer,
	"state" "content_state" DEFAULT 'draft' NOT NULL,
	"relative_id" integer NOT NULL,
	"duration" varchar(50),
	"calendar_color" varchar(50) NOT NULL,
	"featured_image" text,
	"email_content" text,
	"sms_content" text,
	"confirmation_page_message" text,
	"published_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_min_participant_check" CHECK (min_participant >= 0),
	CONSTRAINT "service_max_participant_check" CHECK (max_participant >= 0)
);
--> statement-breakpoint
ALTER TABLE "service" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "participant_data_schema" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"schema" jsonb NOT NULL,
	"slug" varchar(255) NOT NULL,
	"display_according_to_id" uuid,
	"published_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "participant_data_schema_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "participant_data_schema" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "slot" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"custom_label" varchar(255),
	"state" "slot_state" NOT NULL,
	"service_id" uuid,
	"frequency" "frequency_type" NOT NULL,
	"meta_frequency" text,
	"visible" boolean DEFAULT true,
	"date" date NOT NULL,
	"start" time NOT NULL,
	"end" time NOT NULL,
	"max_participant" integer,
	"company_member_id" uuid,
	"private_comment" text,
	"custom_color" varchar(50),
	"published_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "slot_max_participant_check" CHECK (max_participant >= 0)
);
--> statement-breakpoint
ALTER TABLE "slot" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "slot_occurrence" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"slot_id" uuid NOT NULL,
	"service_id" uuid,
	"company_member_id" uuid,
	"date" date NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"state" "slot_state" NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"booking_count" integer DEFAULT 0 NOT NULL,
	"is_exception" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "slot_occurrence_booking_count_check" CHECK (booking_count >= 0)
);
--> statement-breakpoint
ALTER TABLE "slot_occurrence" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "booking" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"relative_id" integer NOT NULL,
	"firstname" varchar(255) NOT NULL,
	"lastname" varchar(255),
	"email" varchar(320),
	"phone" varchar(50),
	"participants" jsonb,
	"slot_id" uuid,
	"slot_occurrence_id" uuid,
	"service_id" uuid,
	"company_member_id" uuid,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"stripe_key" varchar(255),
	"state" "booking_state" NOT NULL,
	"note" text,
	"customer_note" text,
	"published_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "checkout" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"appearance" jsonb NOT NULL,
	"content" jsonb NOT NULL,
	"state" "content_state" DEFAULT 'draft' NOT NULL,
	"relative_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"published_at" timestamp with time zone,
	"page_title" varchar(255),
	"custom_head_content" text,
	"custom_javascript" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "checkout_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "checkout" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "date_memo" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"content" text NOT NULL,
	"date" date NOT NULL,
	"color" varchar(50),
	"organization_role_id" uuid,
	"published_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "date_memo" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "booking_sms_reminder" (
	"booking_id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_price_matrix" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"service_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"col_schema_id" uuid,
	"row_schema_id" uuid,
	"fallback" numeric,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_price_matrix_service_id_key" UNIQUE("service_id")
);
--> statement-breakpoint
ALTER TABLE "service_price_matrix" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "service_price_matrix_interval" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"matrix_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"axis" "matrix_axis" NOT NULL,
	"index" integer NOT NULL,
	"start_value" numeric NOT NULL,
	"end_value" numeric NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_price_matrix_interval_matrix_id_axis_index_key" UNIQUE("matrix_id","axis","index")
);
--> statement-breakpoint
ALTER TABLE "service_price_matrix_interval" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "service_price_extra" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"service_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"schema_doc_id" varchar(255),
	"is_default" boolean DEFAULT false NOT NULL,
	"amount" numeric NOT NULL,
	"description" varchar(255) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_price_extra" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "booking_communication_thread" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"channel" varchar(20) NOT NULL,
	"participant_key" varchar(320) NOT NULL,
	"provider_thread_key" varchar(255),
	"last_message_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_booking_communication_thread_booking_channel_participant" UNIQUE("booking_id","channel","participant_key"),
	CONSTRAINT "booking_communication_thread_channel_check" CHECK ((channel)::text = ANY ((ARRAY['email'::character varying, 'sms'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "booking_communication_thread" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "booking_communication_message" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"thread_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"direction" varchar(20) NOT NULL,
	"channel" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'queued' NOT NULL,
	"provider" varchar(80),
	"provider_message_id" varchar(255),
	"message_id_rfc" varchar(255),
	"in_reply_to_rfc" varchar(255),
	"sender" varchar(320),
	"recipient" varchar(320),
	"subject" text,
	"body_text" text,
	"body_html" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sent_at" timestamp with time zone,
	"received_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "booking_communication_message_direction_check" CHECK ((direction)::text = ANY ((ARRAY['outbound'::character varying, 'inbound'::character varying])::text[])),
	CONSTRAINT "booking_communication_message_channel_check" CHECK ((channel)::text = ANY ((ARRAY['email'::character varying, 'sms'::character varying])::text[])),
	CONSTRAINT "booking_communication_message_status_check" CHECK ((status)::text = ANY ((ARRAY['queued'::character varying, 'sent'::character varying, 'delivered'::character varying, 'failed'::character varying, 'bounced'::character varying, 'complained'::character varying, 'opened'::character varying, 'clicked'::character varying, 'replied'::character varying, 'received'::character varying, 'skipped'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "booking_communication_message" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "booking_communication_status_event" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"message_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"event_type" varchar(30) NOT NULL,
	"provider" varchar(80),
	"provider_event_id" varchar(255),
	"event_at" timestamp with time zone DEFAULT now() NOT NULL,
	"error" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "booking_communication_status_event_event_type_check" CHECK ((event_type)::text = ANY ((ARRAY['queued'::character varying, 'sent'::character varying, 'delivered'::character varying, 'failed'::character varying, 'bounced'::character varying, 'complained'::character varying, 'opened'::character varying, 'clicked'::character varying, 'replied'::character varying, 'received'::character varying, 'provider_update'::character varying, 'skipped'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "booking_communication_status_event" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "service_participant_data_schema" (
	"organization_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"participant_data_schema_id" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_participant_data_schema_pkey" PRIMARY KEY("service_id","participant_data_schema_id")
);
--> statement-breakpoint
ALTER TABLE "service_participant_data_schema" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "service_price_matrix_cell" (
	"matrix_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"row_index" integer NOT NULL,
	"col_index" integer NOT NULL,
	"amount" numeric NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_price_matrix_cell_pkey" PRIMARY KEY("matrix_id","row_index","col_index")
);
--> statement-breakpoint
ALTER TABLE "service_price_matrix_cell" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_setting" ADD CONSTRAINT "user_setting_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_thread" ADD CONSTRAINT "ai_thread_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_message" ADD CONSTRAINT "ai_message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_message" ADD CONSTRAINT "ai_message_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."ai_thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_record" ADD CONSTRAINT "usage_record_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_record" ADD CONSTRAINT "usage_record_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_wallet" ADD CONSTRAINT "ai_wallet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_wallet_transaction" ADD CONSTRAINT "ai_wallet_transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_wallet_transaction" ADD CONSTRAINT "ai_wallet_transaction_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "public"."ai_wallet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_role" ADD CONSTRAINT "organization_role_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_role_permission" ADD CONSTRAINT "organization_role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."organization_role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_role_permission" ADD CONSTRAINT "organization_role_permission_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."organization_role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitation" ADD CONSTRAINT "organization_invitation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitation" ADD CONSTRAINT "organization_invitation_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."organization_role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitation" ADD CONSTRAINT "organization_invitation_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_setting" ADD CONSTRAINT "organization_setting_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_data_schema" ADD CONSTRAINT "participant_data_schema_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_data_schema" ADD CONSTRAINT "participant_data_schema_display_according_to_id_fkey" FOREIGN KEY ("display_according_to_id") REFERENCES "public"."participant_data_schema"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot" ADD CONSTRAINT "slot_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot" ADD CONSTRAINT "slot_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot" ADD CONSTRAINT "slot_company_member_id_fkey" FOREIGN KEY ("company_member_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_occurrence" ADD CONSTRAINT "slot_occurrence_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_occurrence" ADD CONSTRAINT "slot_occurrence_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "public"."slot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_occurrence" ADD CONSTRAINT "slot_occurrence_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_occurrence" ADD CONSTRAINT "slot_occurrence_company_member_id_fkey" FOREIGN KEY ("company_member_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "public"."slot"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_slot_occurrence_id_fkey" FOREIGN KEY ("slot_occurrence_id") REFERENCES "public"."slot_occurrence"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_company_member_id_fkey" FOREIGN KEY ("company_member_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout" ADD CONSTRAINT "checkout_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "date_memo" ADD CONSTRAINT "date_memo_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "date_memo" ADD CONSTRAINT "date_memo_organization_role_id_fkey" FOREIGN KEY ("organization_role_id") REFERENCES "public"."organization_role"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_sms_reminder" ADD CONSTRAINT "booking_sms_reminder_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_sms_reminder" ADD CONSTRAINT "booking_sms_reminder_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_price_matrix" ADD CONSTRAINT "service_price_matrix_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_price_matrix" ADD CONSTRAINT "service_price_matrix_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_price_matrix" ADD CONSTRAINT "service_price_matrix_col_schema_id_fkey" FOREIGN KEY ("col_schema_id") REFERENCES "public"."participant_data_schema"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_price_matrix" ADD CONSTRAINT "service_price_matrix_row_schema_id_fkey" FOREIGN KEY ("row_schema_id") REFERENCES "public"."participant_data_schema"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_price_matrix_interval" ADD CONSTRAINT "service_price_matrix_interval_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "public"."service_price_matrix"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_price_matrix_interval" ADD CONSTRAINT "service_price_matrix_interval_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_price_extra" ADD CONSTRAINT "service_price_extra_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_price_extra" ADD CONSTRAINT "service_price_extra_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_communication_thread" ADD CONSTRAINT "booking_communication_thread_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_communication_thread" ADD CONSTRAINT "booking_communication_thread_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_communication_message" ADD CONSTRAINT "booking_communication_message_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."booking_communication_thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_communication_message" ADD CONSTRAINT "booking_communication_message_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_communication_message" ADD CONSTRAINT "booking_communication_message_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_communication_status_event" ADD CONSTRAINT "booking_communication_status_event_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."booking_communication_message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_communication_status_event" ADD CONSTRAINT "booking_communication_status_event_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_communication_status_event" ADD CONSTRAINT "booking_communication_status_event_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_participant_data_schema" ADD CONSTRAINT "service_participant_data_schema_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_participant_data_schema" ADD CONSTRAINT "service_participant_data_schema_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_participant_data_schema" ADD CONSTRAINT "service_participant_data_schema_participant_data_schema_id_fkey" FOREIGN KEY ("participant_data_schema_id") REFERENCES "public"."participant_data_schema"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_price_matrix_cell" ADD CONSTRAINT "service_price_matrix_cell_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "public"."service_price_matrix"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_price_matrix_cell" ADD CONSTRAINT "service_price_matrix_cell_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ai_wallet_user_id" ON "ai_wallet" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_wallet_transaction_created_at" ON "ai_wallet_transaction" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_wallet_transaction_type" ON "ai_wallet_transaction" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_wallet_transaction_user_id" ON "ai_wallet_transaction" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_wallet_transaction_wallet_id" ON "ai_wallet_transaction" USING btree ("wallet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_service_organization_id" ON "service" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_service_relative_id" ON "service" USING btree ("relative_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_participant_data_schema_display_according_to_id" ON "participant_data_schema" USING btree ("display_according_to_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_participant_data_schema_organization_id" ON "participant_data_schema" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_slot_company_member_id" ON "slot" USING btree ("company_member_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_slot_org_member_date" ON "slot" USING btree ("organization_id" uuid_ops,"company_member_id" uuid_ops,"date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_slot_org_visible_date" ON "slot" USING btree ("organization_id" uuid_ops,"date" uuid_ops) WHERE (visible IS TRUE);--> statement-breakpoint
CREATE INDEX "idx_slot_organization_id" ON "slot" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_slot_service_id" ON "slot" USING btree ("service_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_slot_occurrence_company_member_id" ON "slot_occurrence" USING btree ("company_member_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_slot_occurrence_org_date" ON "slot_occurrence" USING btree ("organization_id" uuid_ops,"date" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_slot_occurrence_org_member_date" ON "slot_occurrence" USING btree ("organization_id" date_ops,"company_member_id" uuid_ops,"date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_slot_occurrence_org_start_at" ON "slot_occurrence" USING btree ("organization_id" timestamptz_ops,"start_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_slot_occurrence_organization_id" ON "slot_occurrence" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_slot_occurrence_service_id" ON "slot_occurrence" USING btree ("service_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_slot_occurrence_slot_id" ON "slot_occurrence" USING btree ("slot_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_slot_occurrence_slot_date" ON "slot_occurrence" USING btree ("slot_id" date_ops,"date" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_slot_occurrence_slot_start" ON "slot_occurrence" USING btree ("slot_id" uuid_ops,"start_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_company_member_id" ON "booking" USING btree ("company_member_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_occurrence_id" ON "booking" USING btree ("slot_occurrence_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_org_member" ON "booking" USING btree ("organization_id" uuid_ops,"company_member_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_org_state" ON "booking" USING btree ("organization_id" uuid_ops,"state" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_organization_id" ON "booking" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_relative_id" ON "booking" USING btree ("relative_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_service_id" ON "booking" USING btree ("service_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_slot_id" ON "booking" USING btree ("slot_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_slot_occurrence_id" ON "booking" USING btree ("slot_occurrence_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_checkout_organization_id" ON "checkout" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_checkout_relative_id" ON "checkout" USING btree ("relative_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_date_memo_organization_id" ON "date_memo" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_date_memo_organization_role_id" ON "date_memo" USING btree ("organization_role_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_sms_reminder_org_schedule" ON "booking_sms_reminder" USING btree ("organization_id" timestamptz_ops,"scheduled_for" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_sms_reminder_schedule" ON "booking_sms_reminder" USING btree ("scheduled_for" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_communication_thread_booking_channel" ON "booking_communication_thread" USING btree ("booking_id" uuid_ops,"channel" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_communication_thread_last_message_at" ON "booking_communication_thread" USING btree ("last_message_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_communication_thread_org_channel" ON "booking_communication_thread" USING btree ("organization_id" uuid_ops,"channel" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_communication_thread_org_channel_last_activity" ON "booking_communication_thread" USING btree ("organization_id" timestamptz_ops,"channel" text_ops,"last_message_at" text_ops,"created_at" text_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_communication_message_booking_channel_created_at" ON "booking_communication_message" USING btree ("booking_id" uuid_ops,"channel" timestamptz_ops,"created_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_communication_message_booking_created_at" ON "booking_communication_message" USING btree ("booking_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_communication_message_in_reply_to_rfc" ON "booking_communication_message" USING btree ("in_reply_to_rfc" text_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_communication_message_message_id_rfc" ON "booking_communication_message" USING btree ("message_id_rfc" text_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_communication_message_org_channel_created_at" ON "booking_communication_message" USING btree ("organization_id" timestamptz_ops,"channel" uuid_ops,"created_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_communication_message_thread_created_at" ON "booking_communication_message" USING btree ("thread_id" uuid_ops,"created_at" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_booking_communication_message_provider_message" ON "booking_communication_message" USING btree ("provider" text_ops,"provider_message_id" text_ops) WHERE (provider_message_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_booking_communication_status_event_booking_event_at" ON "booking_communication_status_event" USING btree ("booking_id" timestamptz_ops,"event_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_communication_status_event_message_event_at" ON "booking_communication_status_event" USING btree ("message_id" uuid_ops,"event_at" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_booking_communication_status_event_provider_event" ON "booking_communication_status_event" USING btree ("provider" text_ops,"provider_event_id" text_ops) WHERE (provider_event_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_service_participant_data_schema_organization_id" ON "service_participant_data_schema" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_service_participant_data_schema_participant_data_schema_id" ON "service_participant_data_schema" USING btree ("participant_data_schema_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_service_participant_data_schema_service_id" ON "service_participant_data_schema" USING btree ("service_id" uuid_ops);--> statement-breakpoint
CREATE VIEW "public"."agenda_slot_day" AS (SELECT so.id AS slot_occurrence_id, so.organization_id, so.company_member_id AS organization_member_id, so.date, so.start_at, so.end_at, so.state, so.visible, so.slot_id, so.service_id, s.name AS service_name, s.calendar_color AS service_calendar_color, s.duration AS service_duration, COALESCE(jsonb_agg(jsonb_build_object('id', b.id, 'relative_id', b.relative_id, 'state', b.state, 'firstname', b.firstname, 'lastname', b.lastname, 'email', b.email, 'phone', b.phone, 'participants', b.participants, 'customer_note', b.customer_note, 'start_at', b.start_at, 'end_at', b.end_at) ORDER BY b.start_at, b.created_at) FILTER (WHERE b.id IS NOT NULL), '[]'::jsonb) AS bookings FROM slot_occurrence so LEFT JOIN service s ON s.id = so.service_id LEFT JOIN booking b ON b.slot_occurrence_id = so.id GROUP BY so.id, so.organization_id, so.company_member_id, so.date, so.start_at, so.end_at, so.state, so.visible, so.slot_id, so.service_id, s.name, s.calendar_color, s.duration);--> statement-breakpoint
CREATE POLICY "user_delete" ON "user" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((( SELECT auth.uid() AS uid) = auth_user_id));--> statement-breakpoint
CREATE POLICY "user_update" ON "user" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "user_read" ON "user" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "user_create" ON "user" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "user_setting_all" ON "user_setting" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = user_setting.user_id) AND ("user".auth_user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = user_setting.user_id) AND ("user".auth_user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "subscription_all" ON "subscription" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = subscription.user_id) AND ("user".auth_user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = subscription.user_id) AND ("user".auth_user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "ai_thread_all" ON "ai_thread" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_thread.user_id) AND ("user".auth_user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_thread.user_id) AND ("user".auth_user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "ai_message_all" ON "ai_message" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM (ai_thread t
     JOIN "user" u ON ((u.id = t.user_id)))
  WHERE ((t.id = ai_message.thread_id) AND (u.auth_user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (ai_thread t
     JOIN "user" u ON ((u.id = t.user_id)))
  WHERE ((t.id = ai_message.thread_id) AND (u.auth_user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "usage_record_all" ON "usage_record" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = usage_record.user_id) AND ("user".auth_user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = usage_record.user_id) AND ("user".auth_user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "ai_usage_all" ON "ai_usage" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_usage.user_id) AND ("user".auth_user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_usage.user_id) AND ("user".auth_user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "ai_wallet_all" ON "ai_wallet" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_wallet.user_id) AND ("user".auth_user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_wallet.user_id) AND ("user".auth_user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "ai_wallet_transaction_all" ON "ai_wallet_transaction" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_wallet_transaction.user_id) AND ("user".auth_user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_wallet_transaction.user_id) AND ("user".auth_user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "organization_delete" ON "organization" AS PERMISSIVE FOR DELETE TO "authenticated" USING (kit.user_is_owner_of_org(id));--> statement-breakpoint
CREATE POLICY "organization_update" ON "organization" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_read" ON "organization" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_create" ON "organization" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_role_delete" ON "organization_role" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'member.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "organization_role_update" ON "organization_role" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_role_insert" ON "organization_role" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_role_read" ON "organization_role" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_role_permission_delete" ON "organization_role_permission" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'member.manage'::org_permission) AND ((permission <> 'member.manage'::org_permission) OR (kit.has_multiple_member_manage_permissions(organization_id) AND (EXISTS ( SELECT 1
   FROM (organization_member om
     JOIN organization_role_permission orp ON ((orp.role_id = om.role_id)))
  WHERE ((om.organization_id = organization_role_permission.organization_id) AND (orp.permission = 'member.manage'::org_permission) AND (om.role_id <> organization_role_permission.role_id))))))));--> statement-breakpoint
CREATE POLICY "organization_role_permission_update" ON "organization_role_permission" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_role_permission_insert" ON "organization_role_permission" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_role_permission_read" ON "organization_role_permission" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_member_delete" ON "organization_member" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND ((user_id = kit.get_user_id()) OR (kit.has_org_permission(organization_id, 'member.manage'::org_permission) AND kit.user_org_role_is_higher_than(organization_id, user_id)))));--> statement-breakpoint
CREATE POLICY "organization_member_update" ON "organization_member" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_member_read" ON "organization_member" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_member_create" ON "organization_member" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_invitation_delete" ON "organization_invitation" AS PERMISSIVE FOR DELETE TO "authenticated" USING (((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'member.manage'::org_permission)) OR ((email)::text ~~* (kit.get_user_email())::text)));--> statement-breakpoint
CREATE POLICY "organization_invitation_update" ON "organization_invitation" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_invitation_read" ON "organization_invitation" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_invitation_create" ON "organization_invitation" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_setting_all" ON "organization_setting" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'setting.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'setting.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "notification_all" ON "notification" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = notification.user_id) AND ("user".auth_user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = notification.user_id) AND ("user".auth_user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "service_all" ON "service" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "participant_data_schema_all" ON "participant_data_schema" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "slot_all" ON "slot" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "slot_occurrence_all" ON "slot_occurrence" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "booking_insert_1" ON "booking" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "booking_all" ON "booking" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "checkout_all" ON "checkout" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "date_memo_all" ON "date_memo" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "service_price_matrix_all" ON "service_price_matrix" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "service_price_matrix_interval_all" ON "service_price_matrix_interval" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "service_price_extra_all" ON "service_price_extra" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "booking_communication_thread_all" ON "booking_communication_thread" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "booking_communication_message_all" ON "booking_communication_message" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "booking_communication_status_event_all" ON "booking_communication_status_event" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "service_participant_data_schema_all" ON "service_participant_data_schema" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "service_price_matrix_cell_all" ON "service_price_matrix_cell" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission)));
*/