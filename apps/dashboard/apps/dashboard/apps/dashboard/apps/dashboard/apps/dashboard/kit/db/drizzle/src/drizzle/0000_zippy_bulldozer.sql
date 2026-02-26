-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."booking_type" AS ENUM('consultation', 'service', 'appointment', 'reservation');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('in_app', 'email');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('info', 'warning', 'error');--> statement-breakpoint
CREATE TYPE "public"."org_permission" AS ENUM('role.manage', 'organization.manage', 'member.manage', 'invitation.manage', 'setting.manage', 'media.manage');--> statement-breakpoint
CREATE TABLE "booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" "booking_type" DEFAULT 'appointment' NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"customer_phone" varchar(50),
	"customer_notes" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"duration_minutes" integer GENERATED ALWAYS AS ((EXTRACT(epoch FROM (end_date - start_date)) / (60)::numeric)) STORED,
	"location" varchar(255),
	"is_online" boolean DEFAULT false,
	"meeting_link" text,
	"price" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"is_paid" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	CONSTRAINT "valid_dates" CHECK (end_date > start_date),
	CONSTRAINT "valid_price" CHECK (price >= (0)::numeric)
);
--> statement-breakpoint
ALTER TABLE "booking" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "booking_tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"color" varchar(7) DEFAULT '#3B82F6',
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "booking_tag_organization_id_name_key" UNIQUE("organization_id","name")
);
--> statement-breakpoint
ALTER TABLE "booking_tag" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT auth.uid() NOT NULL,
	"auth_user_id" uuid DEFAULT auth.uid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320),
	"profile_url" varchar(1000),
	"phone" varchar,
	"completed_onboarding" boolean DEFAULT false NOT NULL,
	"locale" varchar DEFAULT 'en-US' NOT NULL,
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
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"dismissed" boolean DEFAULT false NOT NULL,
	"type" "notification_type" DEFAULT 'info' NOT NULL,
	"channel" "notification_channel" DEFAULT 'in_app' NOT NULL,
	"link" varchar,
	"content" varchar NOT NULL,
	"expires_at" timestamp DEFAULT (now() + '1 mon'::interval),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
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
CREATE TABLE "booking_tag_assignment" (
	"booking_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "booking_tag_assignment_pkey" PRIMARY KEY("booking_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "booking_tag_assignment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_tag" ADD CONSTRAINT "booking_tag_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_setting" ADD CONSTRAINT "user_setting_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "booking_tag_assignment" ADD CONSTRAINT "booking_tag_assignment_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_tag_assignment" ADD CONSTRAINT "booking_tag_assignment_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."booking_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_booking_created_at" ON "booking" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_customer_email" ON "booking" USING btree ("customer_email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_organization_id" ON "booking" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_start_date" ON "booking" USING btree ("start_date" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_status" ON "booking" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_type" ON "booking" USING btree ("type" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_tag_name" ON "booking_tag" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_tag_organization_id" ON "booking_tag" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_tag_assignment_booking_id" ON "booking_tag_assignment" USING btree ("booking_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_booking_tag_assignment_tag_id" ON "booking_tag_assignment" USING btree ("tag_id" uuid_ops);--> statement-breakpoint
CREATE VIEW "public"."booking_analytics" AS (SELECT b.organization_id, date_trunc('day'::text, b.start_date) AS booking_date, b.type, b.status, count(*) AS booking_count, count(DISTINCT b.customer_email) AS unique_customers, sum(b.price) AS total_revenue, avg(b.duration_minutes) AS avg_duration_minutes, count( CASE WHEN b.is_online THEN 1 ELSE NULL::integer END) AS online_bookings, count( CASE WHEN NOT b.is_online THEN 1 ELSE NULL::integer END) AS offline_bookings FROM booking b GROUP BY b.organization_id, (date_trunc('day'::text, b.start_date)), b.type, b.status);--> statement-breakpoint
CREATE VIEW "public"."most_booked_customers" AS (SELECT b.organization_id, b.customer_email, b.customer_name, count(*) AS total_bookings, count( CASE WHEN b.status = 'completed'::booking_status THEN 1 ELSE NULL::integer END) AS completed_bookings, count( CASE WHEN b.status = 'cancelled'::booking_status THEN 1 ELSE NULL::integer END) AS cancelled_bookings, sum(b.price) AS total_spent, max(b.created_at) AS last_booking_date FROM booking b GROUP BY b.organization_id, b.customer_email, b.customer_name ORDER BY (count(*)) DESC);--> statement-breakpoint
CREATE POLICY "Users can view bookings in their organization" ON "booking" AS PERMISSIVE FOR SELECT TO public USING ((organization_id IN ( SELECT m.organization_id
   FROM organization_member m
  WHERE (m.user_id = auth.uid()))));--> statement-breakpoint
CREATE POLICY "Users can create bookings in their organization" ON "booking" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can update bookings in their organization" ON "booking" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Users can delete bookings in their organization" ON "booking" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Users can view booking tags in their organization" ON "booking_tag" AS PERMISSIVE FOR SELECT TO public USING ((organization_id IN ( SELECT m.organization_id
   FROM organization_member m
  WHERE (m.user_id = auth.uid()))));--> statement-breakpoint
CREATE POLICY "Users can manage booking tags in their organization" ON "booking_tag" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "user_create" ON "user" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((( SELECT auth.uid() AS uid) = auth_user_id));--> statement-breakpoint
CREATE POLICY "user_read" ON "user" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "user_update" ON "user" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "user_delete" ON "user" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "user_setting_all" ON "user_setting" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = user_setting.user_id) AND ("user".auth_user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = user_setting.user_id) AND ("user".auth_user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "notification_all" ON "notification" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = notification.user_id) AND ("user".auth_user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = notification.user_id) AND ("user".auth_user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "organization_create" ON "organization" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "organization_read" ON "organization" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_update" ON "organization" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_delete" ON "organization" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_role_read" ON "organization_role" AS PERMISSIVE FOR SELECT TO "authenticated" USING (kit.user_is_member_of_org(organization_id));--> statement-breakpoint
CREATE POLICY "organization_role_insert" ON "organization_role" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_role_update" ON "organization_role" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_role_delete" ON "organization_role" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_role_permission_read" ON "organization_role_permission" AS PERMISSIVE FOR SELECT TO "authenticated" USING (kit.user_is_member_of_org(organization_id));--> statement-breakpoint
CREATE POLICY "organization_role_permission_insert" ON "organization_role_permission" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_role_permission_update" ON "organization_role_permission" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_role_permission_delete" ON "organization_role_permission" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_member_create" ON "organization_member" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (kit.user_is_invited_to_org(organization_id));--> statement-breakpoint
CREATE POLICY "organization_member_read" ON "organization_member" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_member_update" ON "organization_member" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_member_delete" ON "organization_member" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_invitation_create" ON "organization_invitation" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'invitation.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "organization_invitation_read" ON "organization_invitation" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_invitation_update" ON "organization_invitation" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_invitation_delete" ON "organization_invitation" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "organization_setting_all" ON "organization_setting" AS PERMISSIVE FOR ALL TO "authenticated" USING ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'setting.manage'::org_permission))) WITH CHECK ((kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'setting.manage'::org_permission)));--> statement-breakpoint
CREATE POLICY "Users can view booking tag assignments" ON "booking_tag_assignment" AS PERMISSIVE FOR SELECT TO public USING ((booking_id IN ( SELECT b.id
   FROM booking b
  WHERE (b.organization_id IN ( SELECT m.organization_id
           FROM organization_member m
          WHERE (m.user_id = auth.uid()))))));--> statement-breakpoint
CREATE POLICY "Users can manage booking tag assignments" ON "booking_tag_assignment" AS PERMISSIVE FOR ALL TO public;
*/