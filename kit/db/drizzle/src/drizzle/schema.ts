import { pgTable, foreignKey, pgPolicy, uuid, varchar, boolean, timestamp, json, unique, text, jsonb, check, integer, numeric, index, date, time, uniqueIndex, pgView, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


import { authUsers as users } from 'drizzle-orm/supabase';
export const usersInAuth = users;

export const aiThreadStatus = pgEnum("ai_thread_status", ['regular', 'archived'])
export const bookingState = pgEnum("booking_state", ['requires_payment_method', 'requires_slot_confirmation', 'canceled', 'confirmed', 'charged', 'confirmation_failed'])
export const contentState = pgEnum("content_state", ['draft', 'published', 'archived'])
export const notificationType = pgEnum("notification_type", ['info', 'warning', 'error', 'success'])
export const orgPermission = pgEnum("org_permission", ['role.manage', 'organization.manage', 'member.manage', 'invitation.manage', 'setting.manage', 'media.manage'])
export const slotState = pgEnum("slot_state", ['confirmed', 'requested'])


export const user = pgTable("user", {
	id: uuid().default(sql`auth.uid()`).primaryKey().notNull(),
	authUserId: uuid("auth_user_id").default(sql`auth.uid()`).notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }),
	profileUrl: varchar("profile_url", { length: 1000 }),
	phone: varchar(),
	completedOnboarding: boolean("completed_onboarding").default(false).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authUserId],
			foreignColumns: [users.id],
			name: "user_auth_user_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("user_create", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`(( SELECT auth.uid() AS uid) = auth_user_id)`  }),
	pgPolicy("user_delete", { as: "permissive", for: "delete", to: ["authenticated"] }),
	pgPolicy("user_read", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("user_update", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const userSetting = pgTable("user_setting", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	value: json().default({"json":null}).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_setting_user_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("user_setting_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = user_setting.user_id) AND ("user".auth_user_id = auth.uid()))))`, withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = user_setting.user_id) AND ("user".auth_user_id = auth.uid()))))`  }),
]);

export const subscription = pgTable("subscription", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	stripeSubscriptionId: text("stripe_subscription_id").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "subscription_user_id_fkey"
		}).onDelete("cascade"),
	unique("subscription_stripe_subscription_id_key").on(table.stripeSubscriptionId),
	pgPolicy("subscription_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = subscription.user_id) AND ("user".auth_user_id = auth.uid()))))`, withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = subscription.user_id) AND ("user".auth_user_id = auth.uid()))))`  }),
]);

export const aiThread = pgTable("ai_thread", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	title: text(),
	status: aiThreadStatus().default('regular').notNull(),
	externalId: text("external_id"),
	metadata: jsonb().default({}).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "ai_thread_user_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("ai_thread_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_thread.user_id) AND ("user".auth_user_id = auth.uid()))))`, withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_thread.user_id) AND ("user".auth_user_id = auth.uid()))))`  }),
]);

export const aiMessage = pgTable("ai_message", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	threadId: uuid("thread_id").notNull(),
	role: text().notNull(),
	content: text().notNull(),
	toolName: text("tool_name"),
	toolInput: jsonb("tool_input"),
	tokensUsed: integer("tokens_used"),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "ai_message_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.threadId],
			foreignColumns: [aiThread.id],
			name: "ai_message_thread_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("ai_message_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(EXISTS ( SELECT 1
   FROM (ai_thread t
     JOIN "user" u ON ((u.id = t.user_id)))
  WHERE ((t.id = ai_message.thread_id) AND (u.auth_user_id = auth.uid()))))`, withCheck: sql`(EXISTS ( SELECT 1
   FROM (ai_thread t
     JOIN "user" u ON ((u.id = t.user_id)))
  WHERE ((t.id = ai_message.thread_id) AND (u.auth_user_id = auth.uid()))))`  }),
	check("ai_message_role_check", sql`role = ANY (ARRAY['user'::text, 'assistant'::text, 'tool'::text, 'system'::text])`),
]);

export const usageRecord = pgTable("usage_record", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	subscriptionId: uuid("subscription_id").notNull(),
	tokensUsed: integer("tokens_used").notNull(),
	actionType: text("action_type").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "usage_record_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.subscriptionId],
			foreignColumns: [subscription.id],
			name: "usage_record_subscription_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("usage_record_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = usage_record.user_id) AND ("user".auth_user_id = auth.uid()))))`, withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = usage_record.user_id) AND ("user".auth_user_id = auth.uid()))))`  }),
]);

export const aiUsage = pgTable("ai_usage", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	inputTokens: integer("input_tokens").default(0).notNull(),
	outputTokens: integer("output_tokens").default(0).notNull(),
	reasoningTokens: integer("reasoning_tokens").default(0).notNull(),
	cachedInputTokens: integer("cached_input_tokens").default(0).notNull(),
	modelId: text("model_id").notNull(),
	cost: numeric({ precision: 10, scale:  6 }).default('0').notNull(),
	aiTimestamp: timestamp("ai_timestamp", { withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "ai_usage_user_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("ai_usage_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_usage.user_id) AND ("user".auth_user_id = auth.uid()))))`, withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_usage.user_id) AND ("user".auth_user_id = auth.uid()))))`  }),
]);

export const aiWallet = pgTable("ai_wallet", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	balance: numeric({ precision: 10, scale:  6 }).default('0').notNull(),
	currency: varchar({ length: 3 }).default('USD').notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_ai_wallet_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "ai_wallet_user_id_fkey"
		}).onDelete("cascade"),
	unique("ai_wallet_user_id_key").on(table.userId),
	pgPolicy("ai_wallet_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_wallet.user_id) AND ("user".auth_user_id = auth.uid()))))`, withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_wallet.user_id) AND ("user".auth_user_id = auth.uid()))))`  }),
]);

export const aiWalletTransaction = pgTable("ai_wallet_transaction", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	walletId: uuid("wallet_id").notNull(),
	amount: numeric({ precision: 10, scale:  6 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	description: text(),
	balanceAfter: numeric("balance_after", { precision: 10, scale:  6 }).notNull(),
	metadata: jsonb(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_ai_wallet_transaction_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_ai_wallet_transaction_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("idx_ai_wallet_transaction_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	index("idx_ai_wallet_transaction_wallet_id").using("btree", table.walletId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "ai_wallet_transaction_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.walletId],
			foreignColumns: [aiWallet.id],
			name: "ai_wallet_transaction_wallet_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("ai_wallet_transaction_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_wallet_transaction.user_id) AND ("user".auth_user_id = auth.uid()))))`, withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_wallet_transaction.user_id) AND ("user".auth_user_id = auth.uid()))))`  }),
	check("ai_wallet_transaction_type_check", sql`(type)::text = ANY ((ARRAY['deposit'::character varying, 'usage'::character varying, 'refund'::character varying, 'adjustment'::character varying])::text[])`),
]);

export const organization = pgTable("organization", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: text().notNull(),
	address: varchar(),
	email: varchar({ length: 320 }),
	website: varchar({ length: 320 }),
	logoUrl: varchar("logo_url", { length: 1000 }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("organization_slug_key").on(table.slug),
	unique("organization_email_key").on(table.email),
	pgPolicy("organization_create", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`true`  }),
	pgPolicy("organization_delete", { as: "permissive", for: "delete", to: ["authenticated"] }),
	pgPolicy("organization_read", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("organization_update", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const organizationRole = pgTable("organization_role", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	hierarchyLevel: integer("hierarchy_level").notNull(),
	organizationId: uuid("organization_id").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "organization_role_organization_id_fkey"
		}).onDelete("cascade"),
	unique("organization_role_name_organization_id_key").on(table.name, table.organizationId),
	pgPolicy("organization_role_delete", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'role.manage'::org_permission))` }),
	pgPolicy("organization_role_insert", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("organization_role_read", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("organization_role_update", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const organizationRolePermission = pgTable("organization_role_permission", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	roleId: uuid("role_id").notNull(),
	organizationId: uuid("organization_id").notNull(),
	permission: orgPermission().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [organizationRole.id],
			name: "organization_role_permission_role_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "organization_role_permission_organization_id_fkey"
		}).onDelete("cascade"),
	unique("organization_role_permission_role_id_permission_key").on(table.roleId, table.permission),
	pgPolicy("organization_role_permission_delete", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'role.manage'::org_permission) AND ((permission <> 'role.manage'::org_permission) OR (kit.has_multiple_role_manage_permissions(organization_id) AND (EXISTS ( SELECT 1
   FROM (organization_member om
     JOIN organization_role_permission orp ON ((orp.role_id = om.role_id)))
  WHERE ((om.organization_id = organization_role_permission.organization_id) AND (orp.permission = 'role.manage'::org_permission) AND (om.role_id <> organization_role_permission.role_id)))))))` }),
	pgPolicy("organization_role_permission_insert", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("organization_role_permission_read", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("organization_role_permission_update", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const organizationMember = pgTable("organization_member", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	isOwner: boolean("is_owner").default(false).notNull(),
	roleId: uuid("role_id").notNull(),
	userId: uuid("user_id").notNull(),
	organizationId: uuid("organization_id").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [organizationRole.id],
			name: "organization_member_role_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "organization_member_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "organization_member_organization_id_fkey"
		}).onDelete("cascade"),
	unique("organization_member_user_id_organization_id_key").on(table.userId, table.organizationId),
	pgPolicy("organization_member_create", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`kit.user_is_invited_to_org(organization_id)`  }),
	pgPolicy("organization_member_delete", { as: "permissive", for: "delete", to: ["authenticated"] }),
	pgPolicy("organization_member_read", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("organization_member_update", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const organizationInvitation = pgTable("organization_invitation", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	email: varchar({ length: 320 }).notNull(),
	organizationId: uuid("organization_id").notNull(),
	roleId: uuid("role_id").notNull(),
	inviteToken: uuid("invite_token").defaultRandom().notNull(),
	invitedBy: uuid("invited_by").default(sql`auth.uid()`).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).default(sql`(now() + '7 days'::interval)`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "organization_invitation_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [organizationRole.id],
			name: "organization_invitation_role_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.invitedBy],
			foreignColumns: [user.id],
			name: "organization_invitation_invited_by_fkey"
		}).onDelete("cascade"),
	unique("organization_invitation_email_organization_id_key").on(table.email, table.organizationId),
	unique("organization_invitation_invite_token_key").on(table.inviteToken),
	pgPolicy("organization_invitation_create", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'invitation.manage'::org_permission))`  }),
	pgPolicy("organization_invitation_delete", { as: "permissive", for: "delete", to: ["authenticated"] }),
	pgPolicy("organization_invitation_read", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("organization_invitation_update", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const organizationSetting = pgTable("organization_setting", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	value: json().default({"json":null}).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "organization_setting_organization_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("organization_setting_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'setting.manage'::org_permission))`, withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'setting.manage'::org_permission))`  }),
]);

export const notification = pgTable("notification", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	type: notificationType().default('info').notNull(),
	imageUrl: varchar("image_url", { length: 1000 }),
	icon: varchar({ length: 320 }),
	read: boolean().default(false).notNull(),
	title: varchar({ length: 320 }).notNull(),
	body: varchar().notNull(),
	data: jsonb(),
	iosSubtitle: varchar("ios_subtitle", { length: 320 }),
	iosBadgeCount: integer("ios_badge_count"),
	iosSoundName: varchar("ios_sound_name", { length: 320 }),
	androidChannelId: varchar("android_channel_id", { length: 320 }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	organizationId: uuid("organization_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "notification_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "notification_organization_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("notification_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = notification.user_id) AND ("user".auth_user_id = auth.uid()))))`, withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = notification.user_id) AND ("user".auth_user_id = auth.uid()))))`  }),
]);

export const service = pgTable("service", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	images: jsonb(),
	location: varchar({ length: 255 }),
	minParticipant: integer("min_participant").notNull(),
	maxParticipant: integer("max_participant"),
	prices: jsonb().notNull(),
	state: contentState().default('draft').notNull(),
	relativeId: integer("relative_id").notNull(),
	duration: varchar({ length: 50 }),
	calendarColor: varchar("calendar_color", { length: 50 }).notNull(),
	featuredImage: text("featured_image"),
	emailContent: text("email_content"),
	smsContent: text("sms_content"),
	confirmationPageMessage: text("confirmation_page_message"),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_service_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_service_relative_id").using("btree", table.relativeId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "service_organization_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("service_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`, withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`  }),
	check("service_min_participant_check", sql`min_participant >= 0`),
	check("service_max_participant_check", sql`max_participant >= 0`),
]);

export const participantDataSchema = pgTable("participant_data_schema", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	schema: jsonb().notNull(),
	slug: varchar({ length: 255 }).notNull(),
	displayAccordingToId: uuid("display_according_to_id"),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_participant_data_schema_display_according_to_id").using("btree", table.displayAccordingToId.asc().nullsLast().op("uuid_ops")),
	index("idx_participant_data_schema_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "participant_data_schema_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.displayAccordingToId],
			foreignColumns: [table.id],
			name: "participant_data_schema_display_according_to_id_fkey"
		}).onDelete("set null"),
	unique("participant_data_schema_slug_key").on(table.slug),
	pgPolicy("participant_data_schema_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`, withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`  }),
]);

export const serviceParticipantDataSchema = pgTable("service_participant_data_schema", {
	organizationId: uuid("organization_id").notNull(),
	serviceId: uuid("service_id").notNull(),
	participantDataSchemaId: uuid("participant_data_schema_id").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_service_participant_data_schema_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_service_participant_data_schema_participant_data_schema_id").using("btree", table.participantDataSchemaId.asc().nullsLast().op("uuid_ops")),
	index("idx_service_participant_data_schema_service_id").using("btree", table.serviceId.asc().nullsLast().op("uuid_ops")),
	index("idx_spds_participant_data_schema_id").using("btree", table.participantDataSchemaId.asc().nullsLast().op("uuid_ops")),
	index("idx_spds_service_id").using("btree", table.serviceId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "service_participant_data_schema_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serviceId],
			foreignColumns: [service.id],
			name: "service_participant_data_schema_service_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.participantDataSchemaId],
			foreignColumns: [participantDataSchema.id],
			name: "service_participant_data_schema_participant_data_schema_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("service_participant_data_schema_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`, withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`  }),
]);

export const slot = pgTable("slot", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	customLabel: varchar("custom_label", { length: 255 }),
	state: slotState().notNull(),
	serviceId: uuid("service_id"),
	frequency: jsonb().notNull(),
	visible: boolean().default(true),
	date: date().notNull(),
	start: time().notNull(),
	end: time().notNull(),
	maxParticipant: integer("max_participant"),
	companyMemberId: uuid("company_member_id"),
	privateComment: text("private_comment"),
	customColor: varchar("custom_color", { length: 50 }),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_slot_company_member_id").using("btree", table.companyMemberId.asc().nullsLast().op("uuid_ops")),
	index("idx_slot_org_member_date").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.companyMemberId.asc().nullsLast().op("uuid_ops"), table.date.asc().nullsLast().op("date_ops")),
	index("idx_slot_org_visible_date").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.date.asc().nullsLast().op("uuid_ops")).where(sql`(visible IS TRUE)`),
	index("idx_slot_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_slot_service_id").using("btree", table.serviceId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "slot_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serviceId],
			foreignColumns: [service.id],
			name: "slot_service_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.companyMemberId],
			foreignColumns: [user.id],
			name: "slot_company_member_id_fkey"
		}).onDelete("set null"),
	pgPolicy("slot_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`, withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`  }),
	check("slot_max_participant_check", sql`max_participant >= 0`),
]);

export const slotOccurrence = pgTable("slot_occurrence", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	slotId: uuid("slot_id").notNull(),
	serviceId: uuid("service_id"),
	companyMemberId: uuid("company_member_id"),
	date: date().notNull(),
	startAt: timestamp("start_at", { withTimezone: true, mode: 'string' }).notNull(),
	endAt: timestamp("end_at", { withTimezone: true, mode: 'string' }).notNull(),
	state: slotState().notNull(),
	visible: boolean().default(true).notNull(),
	bookingCount: integer("booking_count").default(0).notNull(),
	isException: boolean("is_exception").default(false).notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_slot_occurrence_company_member_id").using("btree", table.companyMemberId.asc().nullsLast().op("uuid_ops")),
	index("idx_slot_occurrence_org_date").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.date.asc().nullsLast().op("uuid_ops")),
	index("idx_slot_occurrence_org_member_date").using("btree", table.organizationId.asc().nullsLast().op("date_ops"), table.companyMemberId.asc().nullsLast().op("uuid_ops"), table.date.asc().nullsLast().op("date_ops")),
	index("idx_slot_occurrence_org_start_at").using("btree", table.organizationId.asc().nullsLast().op("timestamptz_ops"), table.startAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_slot_occurrence_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_slot_occurrence_service_id").using("btree", table.serviceId.asc().nullsLast().op("uuid_ops")),
	index("idx_slot_occurrence_slot_id").using("btree", table.slotId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("uq_slot_occurrence_slot_date").using("btree", table.slotId.asc().nullsLast().op("date_ops"), table.date.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("uq_slot_occurrence_slot_start").using("btree", table.slotId.asc().nullsLast().op("uuid_ops"), table.startAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "slot_occurrence_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.slotId],
			foreignColumns: [slot.id],
			name: "slot_occurrence_slot_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serviceId],
			foreignColumns: [service.id],
			name: "slot_occurrence_service_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.companyMemberId],
			foreignColumns: [user.id],
			name: "slot_occurrence_company_member_id_fkey"
		}).onDelete("set null"),
	pgPolicy("slot_occurrence_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`, withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`  }),
	check("slot_occurrence_booking_count_check", sql`booking_count >= 0`),
]);

export const booking = pgTable("booking", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	relativeId: integer("relative_id").notNull(),
	firstname: varchar({ length: 255 }).notNull(),
	lastname: varchar({ length: 255 }),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	participants: jsonb(),
	day: date(),
	slotId: uuid("slot_id"),
	slotOccurrenceId: uuid("slot_occurrence_id"),
	serviceId: uuid("service_id"),
	companyMemberId: uuid("company_member_id"),
	startAt: timestamp("start_at", { withTimezone: true, mode: 'string' }),
	endAt: timestamp("end_at", { withTimezone: true, mode: 'string' }),
	stripeKey: varchar("stripe_key", { length: 255 }),
	state: bookingState().notNull(),
	note: text(),
	customerNote: text("customer_note"),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_booking_company_member_id").using("btree", table.companyMemberId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_occurrence_day").using("btree", table.slotOccurrenceId.asc().nullsLast().op("uuid_ops"), table.day.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_org_day_state").using("btree", table.organizationId.asc().nullsLast().op("date_ops"), table.day.asc().nullsLast().op("enum_ops"), table.state.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_org_member_day").using("btree", table.organizationId.asc().nullsLast().op("date_ops"), table.companyMemberId.asc().nullsLast().op("date_ops"), table.day.asc().nullsLast().op("date_ops")),
	index("idx_booking_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_relative_id").using("btree", table.relativeId.asc().nullsLast().op("int4_ops")),
	index("idx_booking_service_id").using("btree", table.serviceId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_slot_id").using("btree", table.slotId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_slot_occurrence_id").using("btree", table.slotOccurrenceId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "booking_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.slotId],
			foreignColumns: [slot.id],
			name: "booking_slot_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.slotOccurrenceId],
			foreignColumns: [slotOccurrence.id],
			name: "booking_slot_occurrence_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.serviceId],
			foreignColumns: [service.id],
			name: "booking_service_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.companyMemberId],
			foreignColumns: [user.id],
			name: "booking_company_member_id_fkey"
		}).onDelete("set null"),
	pgPolicy("booking_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`, withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`  }),
	pgPolicy("booking_insert_1", { as: "permissive", for: "insert", to: ["public"] }),
]);

export const checkout = pgTable("checkout", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	appearance: jsonb().notNull(),
	content: jsonb().notNull(),
	state: contentState().default('draft').notNull(),
	relativeId: integer("relative_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_checkout_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_checkout_relative_id").using("btree", table.relativeId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "checkout_organization_id_fkey"
		}).onDelete("cascade"),
	unique("checkout_slug_key").on(table.slug),
	pgPolicy("checkout_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`, withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`  }),
]);

export const dateMemo = pgTable("date_memo", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	content: text().notNull(),
	date: date().notNull(),
	color: varchar({ length: 50 }),
	organizationRoleId: uuid("organization_role_id"),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_date_memo_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_date_memo_organization_role_id").using("btree", table.organizationRoleId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "date_memo_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationRoleId],
			foreignColumns: [organizationRole.id],
			name: "date_memo_organization_role_id_fkey"
		}).onDelete("set null"),
	pgPolicy("date_memo_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`, withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`  }),
]);

export const bookingSmsReminder = pgTable("booking_sms_reminder", {
	bookingId: uuid("booking_id").primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	scheduledFor: timestamp("scheduled_for", { withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_booking_sms_reminder_org_schedule").using("btree", table.organizationId.asc().nullsLast().op("timestamptz_ops"), table.scheduledFor.asc().nullsLast().op("timestamptz_ops")),
	index("idx_booking_sms_reminder_schedule").using("btree", table.scheduledFor.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [booking.id],
			name: "booking_sms_reminder_booking_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "booking_sms_reminder_organization_id_fkey"
		}).onDelete("cascade"),
]);
export const agendaSlotDay = pgView("agenda_slot_day", {	slotOccurrenceId: uuid("slot_occurrence_id"),
	organizationId: uuid("organization_id"),
	organizationMemberId: uuid("organization_member_id"),
	date: date(),
	startAt: timestamp("start_at", { withTimezone: true, mode: 'string' }),
	endAt: timestamp("end_at", { withTimezone: true, mode: 'string' }),
	state: slotState(),
	visible: boolean(),
	slotId: uuid("slot_id"),
	serviceId: uuid("service_id"),
	serviceName: varchar("service_name", { length: 255 }),
	serviceCalendarColor: varchar("service_calendar_color", { length: 50 }),
	serviceDuration: varchar("service_duration", { length: 50 }),
	bookings: jsonb(),
}).as(sql`SELECT so.id AS slot_occurrence_id, so.organization_id, so.company_member_id AS organization_member_id, so.date, so.start_at, so.end_at, so.state, so.visible, so.slot_id, so.service_id, s.name AS service_name, s.calendar_color AS service_calendar_color, s.duration AS service_duration, COALESCE(jsonb_agg(jsonb_build_object('id', b.id, 'relative_id', b.relative_id, 'state', b.state, 'firstname', b.firstname, 'lastname', b.lastname, 'email', b.email, 'phone', b.phone, 'participants', b.participants, 'customer_note', b.customer_note, 'day', b.day, 'start_at', b.start_at, 'end_at', b.end_at) ORDER BY b.start_at, b.created_at) FILTER (WHERE b.id IS NOT NULL), '[]'::jsonb) AS bookings FROM slot_occurrence so LEFT JOIN service s ON s.id = so.service_id LEFT JOIN booking b ON b.slot_occurrence_id = so.id GROUP BY so.id, so.organization_id, so.company_member_id, so.date, so.start_at, so.end_at, so.state, so.visible, so.slot_id, so.service_id, s.name, s.calendar_color, s.duration`);
