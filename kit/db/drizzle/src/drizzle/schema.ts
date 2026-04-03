import { pgTable, foreignKey, pgPolicy, uuid, varchar, boolean, timestamp, json, unique, text, jsonb, check, integer, numeric, index, uniqueIndex, date, time, primaryKey, pgView, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


import { authUsers as users } from 'drizzle-orm/supabase';
export const usersInAuth = users;

export const aiThreadStatus = pgEnum("ai_thread_status", ['regular', 'archived'])
export const bookingPaymentStatus = pgEnum("booking_payment_status", ['none', 'setup_pending', 'setup_succeeded', 'payment_pending', 'authorized', 'captured', 'failed', 'released'])
export const bookingState = pgEnum("booking_state", ['requires_payment_method', 'requires_slot_confirmation', 'canceled', 'confirmed', 'charged', 'confirmation_failed', 'partially_refunded', 'refunded'])
export const contentState = pgEnum("content_state", ['draft', 'published', 'archived'])
export const creditNoteStatus = pgEnum("credit_note_status", ['issued', 'void'])
export const discountRedemptionStatus = pgEnum("discount_redemption_status", ['reserved', 'consumed', 'released'])
export const discountType = pgEnum("discount_type", ['percentage', 'fixed'])
export const frequencyType = pgEnum("frequency_type", ['once', 'day', 'week', 'month', 'year'])
export const invoiceStatus = pgEnum("invoice_status", ['issued', 'partially_refunded', 'refunded'])
export const matrixAxis = pgEnum("matrix_axis", ['row', 'col'])
export const notificationType = pgEnum("notification_type", ['info', 'warning', 'error', 'success'])
export const orgPermission = pgEnum("org_permission", ['organization.manage', 'member.manage', 'setting.manage', 'media.manage', 'booking.select', 'booking.insert', 'booking.update', 'booking.delete', 'service.select', 'service.insert', 'service.update', 'service.delete', 'checkout.select', 'checkout.insert', 'checkout.update', 'checkout.delete', 'slot.select', 'slot.insert', 'slot.update', 'slot.delete', 'slot_admin.select', 'slot_admin.insert', 'slot_admin.update', 'slot_admin.delete'])
export const serviceTaxMode = pgEnum("service_tax_mode", ['all', 'custom'])
export const slotState = pgEnum("slot_state", ['confirmed', 'requested'])
export const taxMode = pgEnum("tax_mode", ['inclusive', 'exclusive'])


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
			columns: [table.threadId],
			foreignColumns: [aiThread.id],
			name: "ai_message_thread_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "ai_message_user_id_fkey"
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
			columns: [table.subscriptionId],
			foreignColumns: [subscription.id],
			name: "usage_record_subscription_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "usage_record_user_id_fkey"
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
	pgPolicy("organization_role_delete", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'member.manage'::org_permission))` }),
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
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "organization_role_permission_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [organizationRole.id],
			name: "organization_role_permission_role_id_fkey"
		}).onDelete("cascade"),
	unique("organization_role_permission_role_id_permission_key").on(table.roleId, table.permission),
	pgPolicy("organization_role_permission_delete", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'member.manage'::org_permission) AND ((permission <> 'member.manage'::org_permission) OR (kit.has_multiple_member_manage_permissions(organization_id) AND (EXISTS ( SELECT 1
   FROM (organization_member om
     JOIN organization_role_permission orp ON ((orp.role_id = om.role_id)))
  WHERE ((om.organization_id = organization_role_permission.organization_id) AND (orp.permission = 'member.manage'::org_permission) AND (om.role_id <> organization_role_permission.role_id)))))))` }),
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
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "organization_member_organization_id_fkey"
		}).onDelete("cascade"),
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
			columns: [table.invitedBy],
			foreignColumns: [user.id],
			name: "organization_invitation_invited_by_fkey"
		}).onDelete("cascade"),
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
	unique("organization_invitation_email_organization_id_key").on(table.email, table.organizationId),
	unique("organization_invitation_invite_token_key").on(table.inviteToken),
	pgPolicy("organization_invitation_create", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'member.manage'::org_permission))`  }),
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
	uniqueIndex("uq_organization_setting_org_name").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "organization_setting_organization_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("organization_setting_delete", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'setting.manage'::org_permission))` }),
	pgPolicy("organization_setting_insert", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("organization_setting_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("organization_setting_update", { as: "permissive", for: "update", to: ["authenticated"] }),
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
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "notification_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "notification_user_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("notification_all", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = notification.user_id) AND ("user".auth_user_id = auth.uid()))))`, withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = notification.user_id) AND ("user".auth_user_id = auth.uid()))))`  }),
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
			columns: [table.displayAccordingToId],
			foreignColumns: [table.id],
			name: "participant_data_schema_display_according_to_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "participant_data_schema_organization_id_fkey"
		}).onDelete("cascade"),
	unique("participant_data_schema_slug_key").on(table.slug),
	pgPolicy("participant_data_schema_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'service.delete'::org_permission))` }),
	pgPolicy("participant_data_schema_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("participant_data_schema_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("participant_data_schema_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const slot = pgTable("slot", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	customLabel: varchar("custom_label", { length: 255 }),
	state: slotState().notNull(),
	serviceId: uuid("service_id"),
	frequency: frequencyType().notNull(),
	metaFrequency: text("meta_frequency"),
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
			columns: [table.companyMemberId],
			foreignColumns: [user.id],
			name: "slot_company_member_id_fkey"
		}).onDelete("set null"),
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
	pgPolicy("slot_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND (kit.has_org_permission(organization_id, 'slot_admin.delete'::org_permission) OR (kit.has_org_permission(organization_id, 'slot.delete'::org_permission) AND (company_member_id = kit.get_user_id()))))` }),
	pgPolicy("slot_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("slot_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("slot_update", { as: "permissive", for: "update", to: ["authenticated"] }),
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
			columns: [table.companyMemberId],
			foreignColumns: [user.id],
			name: "slot_occurrence_company_member_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "slot_occurrence_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serviceId],
			foreignColumns: [service.id],
			name: "slot_occurrence_service_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.slotId],
			foreignColumns: [slot.id],
			name: "slot_occurrence_slot_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("slot_occurrence_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND (kit.has_org_permission(organization_id, 'slot_admin.delete'::org_permission) OR (kit.has_org_permission(organization_id, 'slot.delete'::org_permission) AND (company_member_id = kit.get_user_id()))))` }),
	pgPolicy("slot_occurrence_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("slot_occurrence_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("slot_occurrence_update", { as: "permissive", for: "update", to: ["authenticated"] }),
	check("slot_occurrence_booking_count_check", sql`booking_count >= 0`),
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
	pageTitle: varchar("page_title", { length: 255 }),
	customHeadContent: text("custom_head_content"),
	customJavascript: text("custom_javascript"),
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
	pgPolicy("checkout_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'checkout.delete'::org_permission))` }),
	pgPolicy("checkout_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("checkout_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("checkout_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const checkoutPageView = pgTable("checkout_page_view", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	checkoutId: uuid("checkout_id").notNull(),
	sessionId: varchar("session_id", { length: 255 }).notNull(),
	viewId: uuid("view_id").notNull(),
	referrer: text(),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_checkout_page_view_checkout_created_at").using("btree", table.checkoutId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_checkout_page_view_checkout_id").using("btree", table.checkoutId.asc().nullsLast().op("uuid_ops")),
	index("idx_checkout_page_view_org_checkout_created_at").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.checkoutId.asc().nullsLast().op("uuid_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_checkout_page_view_org_created_at").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.createdAt.desc().nullsFirst().op("uuid_ops")),
	index("idx_checkout_page_view_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_checkout_page_view_session_id").using("btree", table.sessionId.asc().nullsLast().op("text_ops")),
	index("idx_checkout_page_view_view_id").using("btree", table.viewId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("uq_checkout_page_view_view_id").using("btree", table.viewId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.checkoutId],
			foreignColumns: [checkout.id],
			name: "checkout_page_view_checkout_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "checkout_page_view_organization_id_fkey"
		}).onDelete("cascade"),
	unique("checkout_page_view_view_id_key").on(table.viewId),
	pgPolicy("checkout_page_view_select", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'checkout.select'::org_permission))` }),
]);

export const dateMemo = pgTable("date_memo", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	content: text().notNull(),
	date: date().notNull(),
	color: varchar({ length: 50 }),
	userId: uuid("user_id").default(sql`kit.get_user_id()`).notNull(),
	organizationRoleId: uuid("organization_role_id"),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_date_memo_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_date_memo_organization_role_id").using("btree", table.organizationRoleId.asc().nullsLast().op("uuid_ops")),
	index("idx_date_memo_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
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
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "date_memo_user_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("date_memo_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND (kit.has_org_permission(organization_id, 'slot_admin.delete'::org_permission) OR (kit.has_org_permission(organization_id, 'slot.delete'::org_permission) AND (user_id = kit.get_user_id()))))` }),
	pgPolicy("date_memo_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("date_memo_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("date_memo_update", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const bookingSmsReminder = pgTable("booking_sms_reminder", {
	organizationId: uuid("organization_id").notNull(),
	bookingId: uuid("booking_id").primaryKey().notNull(),
	scheduledFor: timestamp("scheduled_for", { withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_booking_sms_reminder_booking_id").using("btree", table.bookingId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_sms_reminder_org_schedule").using("btree", table.organizationId.asc().nullsLast().op("timestamptz_ops"), table.scheduledFor.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_sms_reminder_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
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
	pgPolicy("booking_sms_reminder_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'booking.delete'::org_permission))` }),
	pgPolicy("booking_sms_reminder_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("booking_sms_reminder_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("booking_sms_reminder_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const servicePriceMatrix = pgTable("service_price_matrix", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	serviceId: uuid("service_id").notNull(),
	currency: varchar({ length: 3 }).default('EUR').notNull(),
	colSchemaId: uuid("col_schema_id"),
	rowSchemaId: uuid("row_schema_id"),
	fallback: numeric(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_service_price_matrix_col_schema_id").using("btree", table.colSchemaId.asc().nullsLast().op("uuid_ops")),
	index("idx_service_price_matrix_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_service_price_matrix_row_schema_id").using("btree", table.rowSchemaId.asc().nullsLast().op("uuid_ops")),
	index("idx_service_price_matrix_service_id").using("btree", table.serviceId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.colSchemaId],
			foreignColumns: [participantDataSchema.id],
			name: "service_price_matrix_col_schema_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "service_price_matrix_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.rowSchemaId],
			foreignColumns: [participantDataSchema.id],
			name: "service_price_matrix_row_schema_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.serviceId],
			foreignColumns: [service.id],
			name: "service_price_matrix_service_id_fkey"
		}).onDelete("cascade"),
	unique("service_price_matrix_service_id_key").on(table.serviceId),
	pgPolicy("service_price_matrix_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'service.delete'::org_permission))` }),
	pgPolicy("service_price_matrix_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("service_price_matrix_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("service_price_matrix_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const servicePriceMatrixInterval = pgTable("service_price_matrix_interval", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	matrixId: uuid("matrix_id").notNull(),
	axis: matrixAxis().notNull(),
	index: integer().notNull(),
	startValue: numeric("start_value").notNull(),
	endValue: numeric("end_value").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_service_price_matrix_interval_matrix_id").using("btree", table.matrixId.asc().nullsLast().op("uuid_ops")),
	index("idx_service_price_matrix_interval_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("uq_service_price_matrix_interval_matrix_axis_index").using("btree", table.matrixId.asc().nullsLast().op("int4_ops"), table.axis.asc().nullsLast().op("int4_ops"), table.index.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.matrixId],
			foreignColumns: [servicePriceMatrix.id],
			name: "service_price_matrix_interval_matrix_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "service_price_matrix_interval_organization_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("service_price_matrix_interval_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'service.delete'::org_permission))` }),
	pgPolicy("service_price_matrix_interval_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("service_price_matrix_interval_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("service_price_matrix_interval_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const planobyStripeEventLog = pgTable("planoby_stripe_event_log", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	stripeEventId: varchar("stripe_event_id", { length: 255 }).notNull(),
	eventType: varchar("event_type", { length: 255 }).notNull(),
	organizationId: uuid("organization_id"),
	bookingId: uuid("booking_id"),
	payload: jsonb().default({}).notNull(),
	processedAt: timestamp("processed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_planoby_stripe_event_log_booking").using("btree", table.bookingId.asc().nullsLast().op("uuid_ops")),
	index("idx_planoby_stripe_event_log_org").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [booking.id],
			name: "planoby_stripe_event_log_booking_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "planoby_stripe_event_log_organization_id_fkey"
		}).onDelete("set null"),
	unique("planoby_stripe_event_log_stripe_event_id_key").on(table.stripeEventId),
	pgPolicy("planoby_stripe_event_log_delete", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`((organization_id IS NULL) OR (kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'booking.delete'::org_permission)))` }),
	pgPolicy("planoby_stripe_event_log_insert", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("planoby_stripe_event_log_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("planoby_stripe_event_log_update", { as: "permissive", for: "update", to: ["authenticated"] }),
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
	taxMode: serviceTaxMode("tax_mode").default('all').notNull(),
}, (table) => [
	index("idx_service_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_service_relative_id").using("btree", table.relativeId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "service_organization_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("service_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'service.delete'::org_permission))` }),
	pgPolicy("service_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("service_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("service_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
	check("service_max_participant_check", sql`max_participant >= 0`),
	check("service_min_participant_check", sql`min_participant >= 0`),
]);

export const booking = pgTable("booking", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	relativeId: integer("relative_id").notNull(),
	firstname: varchar({ length: 255 }).notNull(),
	lastname: varchar({ length: 255 }),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	customerStreet: varchar("customer_street", { length: 255 }),
	customerZip: varchar("customer_zip", { length: 64 }),
	customerCountry: varchar("customer_country", { length: 128 }),
	participants: jsonb(),
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
	paymentMode: varchar("payment_mode", { length: 64 }).default('no_payment_required').notNull(),
	paymentStatus: bookingPaymentStatus("payment_status").default('none').notNull(),
	stripeConnectAccountId: varchar("stripe_connect_account_id", { length: 255 }),
	setupIntentId: varchar("setup_intent_id", { length: 255 }),
	paymentIntentId: varchar("payment_intent_id", { length: 255 }),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
	stripePaymentMethodId: varchar("stripe_payment_method_id", { length: 255 }),
	paymentAmount: numeric("payment_amount", { precision: 12, scale:  2 }),
	paymentSubtotalBeforeDiscountAmount: numeric("payment_subtotal_before_discount_amount", { precision: 12, scale:  2 }),
	paymentDiscountAmount: numeric("payment_discount_amount", { precision: 12, scale:  2 }).default('0').notNull(),
	paymentDiscountName: varchar("payment_discount_name", { length: 160 }),
	paymentDiscountCode: varchar("payment_discount_code", { length: 32 }),
	paymentDiscountCodeNormalized: varchar("payment_discount_code_normalized", { length: 32 }),
	paymentDiscountType: discountType("payment_discount_type"),
	paymentDiscountValue: numeric("payment_discount_value", { precision: 12, scale:  2 }),
	paymentCurrency: varchar("payment_currency", { length: 10 }),
	paymentAuthorizedAt: timestamp("payment_authorized_at", { withTimezone: true, mode: 'string' }),
	paymentCapturedAt: timestamp("payment_captured_at", { withTimezone: true, mode: 'string' }),
	paymentReleasedAt: timestamp("payment_released_at", { withTimezone: true, mode: 'string' }),
	paymentFailedAt: timestamp("payment_failed_at", { withTimezone: true, mode: 'string' }),
	paymentError: text("payment_error"),
	paymentMetadata: jsonb("payment_metadata").default({}).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	paymentSubtotalAmount: numeric("payment_subtotal_amount", { precision: 12, scale:  2 }),
	paymentTaxAmount: numeric("payment_tax_amount", { precision: 12, scale:  2 }),
	paymentTaxInclusiveAmount: numeric("payment_tax_inclusive_amount", { precision: 12, scale:  2 }),
	paymentTaxExclusiveAmount: numeric("payment_tax_exclusive_amount", { precision: 12, scale:  2 }),
	paymentTaxBreakdown: jsonb("payment_tax_breakdown").default([]).notNull(),
	paymentRefundedAmount: numeric("payment_refunded_amount", { precision: 12, scale:  2 }).default('0').notNull(),
	paymentRefundedAt: timestamp("payment_refunded_at", { withTimezone: true, mode: 'string' }),
	invoiceSnapshot: jsonb("invoice_snapshot").default({}).notNull(),
}, (table) => [
	index("idx_booking_company_member_id").using("btree", table.companyMemberId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_occurrence_id").using("btree", table.slotOccurrenceId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_org_member").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.companyMemberId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_org_normalized_email_start_created").using("btree", sql`organization_id`, sql`lower(TRIM(BOTH FROM COALESCE(email, ''::character varying)))`, sql`start_at`, sql`created_at`),
	index("idx_booking_org_payment_refunded_amount").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.paymentRefundedAmount.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_org_payment_status").using("btree", table.organizationId.asc().nullsLast().op("enum_ops"), table.paymentStatus.asc().nullsLast().op("enum_ops")),
	index("idx_booking_org_state").using("btree", table.organizationId.asc().nullsLast().op("enum_ops"), table.state.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_payment_intent_id").using("btree", table.paymentIntentId.asc().nullsLast().op("text_ops")),
	index("idx_booking_relative_id").using("btree", table.relativeId.asc().nullsLast().op("int4_ops")),
	index("idx_booking_service_id").using("btree", table.serviceId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_setup_intent_id").using("btree", table.setupIntentId.asc().nullsLast().op("text_ops")),
	index("idx_booking_slot_id").using("btree", table.slotId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_slot_occurrence_id").using("btree", table.slotOccurrenceId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_stripe_connect_account_id").using("btree", table.stripeConnectAccountId.asc().nullsLast().op("text_ops")),
	index("idx_booking_stripe_customer_id").using("btree", table.stripeCustomerId.asc().nullsLast().op("text_ops")),
	index("idx_booking_stripe_payment_method_id").using("btree", table.stripePaymentMethodId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.companyMemberId],
			foreignColumns: [user.id],
			name: "booking_company_member_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "booking_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serviceId],
			foreignColumns: [service.id],
			name: "booking_service_id_fkey"
		}).onDelete("set null"),
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
	pgPolicy("booking_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'booking.delete'::org_permission))` }),
	pgPolicy("booking_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("booking_insert_4", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("booking_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("booking_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const organizationTax = pgTable("organization_tax", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	name: varchar({ length: 120 }).notNull(),
	rate: numeric({ precision: 8, scale:  4 }).notNull(),
	mode: taxMode().default('inclusive').notNull(),
	enabled: boolean().default(true).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_organization_tax_org").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_organization_tax_org_enabled_sort").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.enabled.asc().nullsLast().op("bool_ops"), table.sortOrder.asc().nullsLast().op("bool_ops"), table.createdAt.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "organization_tax_organization_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("organization_tax_delete", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'setting.manage'::org_permission))` }),
	pgPolicy("organization_tax_insert", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("organization_tax_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("organization_tax_update", { as: "permissive", for: "update", to: ["authenticated"] }),
	check("chk_organization_tax_rate", sql`(rate > (0)::numeric) AND (rate <= (100)::numeric)`),
]);

export const invoice = pgTable("invoice", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	bookingId: uuid("booking_id").notNull(),
	number: varchar({ length: 64 }).notNull(),
	year: integer().notNull(),
	sequence: integer().notNull(),
	status: invoiceStatus().default('issued').notNull(),
	currency: varchar({ length: 10 }).notNull(),
	subtotalAmount: numeric("subtotal_amount", { precision: 12, scale:  2 }).notNull(),
	taxAmount: numeric("tax_amount", { precision: 12, scale:  2 }).notNull(),
	totalAmount: numeric("total_amount", { precision: 12, scale:  2 }).notNull(),
	refundedAmount: numeric("refunded_amount", { precision: 12, scale:  2 }).default('0').notNull(),
	paidAt: timestamp("paid_at", { withTimezone: true, mode: 'string' }),
	stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
	stripeChargeId: varchar("stripe_charge_id", { length: 255 }),
	pdfPath: text("pdf_path"),
	pdfPublicUrl: text("pdf_public_url"),
	snapshot: jsonb().default({}).notNull(),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_planoby_invoice_booking").using("btree", table.bookingId.asc().nullsLast().op("uuid_ops")),
	index("idx_planoby_invoice_org_created").using("btree", table.organizationId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("uuid_ops")),
	index("idx_planoby_invoice_status").using("btree", table.organizationId.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [booking.id],
			name: "invoice_booking_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "invoice_organization_id_fkey"
		}).onDelete("cascade"),
	unique("uq_planoby_invoice_number").on(table.organizationId, table.year, table.sequence),
	unique("uq_planoby_invoice_booking").on(table.bookingId),
	pgPolicy("planoby_invoice_delete", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'booking.delete'::org_permission))` }),
	pgPolicy("planoby_invoice_insert", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("planoby_invoice_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("planoby_invoice_update", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const creditNote = pgTable("credit_note", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	bookingId: uuid("booking_id").notNull(),
	invoiceId: uuid("invoice_id").notNull(),
	number: varchar({ length: 64 }).notNull(),
	year: integer().notNull(),
	sequence: integer().notNull(),
	status: creditNoteStatus().default('issued').notNull(),
	currency: varchar({ length: 10 }).notNull(),
	refundAmount: numeric("refund_amount", { precision: 12, scale:  2 }).notNull(),
	refundTaxAmount: numeric("refund_tax_amount", { precision: 12, scale:  2 }).default('0').notNull(),
	stripeRefundId: varchar("stripe_refund_id", { length: 255 }),
	reason: text(),
	pdfPath: text("pdf_path"),
	pdfPublicUrl: text("pdf_public_url"),
	snapshot: jsonb().default({}).notNull(),
	metadata: jsonb().default({}).notNull(),
	issuedAt: timestamp("issued_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_planoby_credit_note_booking").using("btree", table.bookingId.asc().nullsLast().op("uuid_ops")),
	index("idx_planoby_credit_note_invoice").using("btree", table.invoiceId.asc().nullsLast().op("uuid_ops")),
	index("idx_planoby_credit_note_org_created").using("btree", table.organizationId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("uuid_ops")),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [booking.id],
			name: "credit_note_booking_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoice.id],
			name: "credit_note_invoice_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "credit_note_organization_id_fkey"
		}).onDelete("cascade"),
	unique("uq_planoby_credit_note_number").on(table.organizationId, table.year, table.sequence),
	unique("uq_planoby_credit_note_refund").on(table.stripeRefundId),
	pgPolicy("planoby_credit_note_delete", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'booking.delete'::org_permission))` }),
	pgPolicy("planoby_credit_note_insert", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("planoby_credit_note_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("planoby_credit_note_update", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const bookingClientAccessChallenge = pgTable("booking_client_access_challenge", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	emailNormalized: varchar("email_normalized", { length: 320 }).notNull(),
	otpSalt: varchar("otp_salt", { length: 64 }).notNull(),
	otpHash: varchar("otp_hash", { length: 128 }).notNull(),
	attempts: integer().default(0).notNull(),
	maxAttempts: integer("max_attempts").default(5).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	consumedAt: timestamp("consumed_at", { withTimezone: true, mode: 'string' }),
	requestedIp: varchar("requested_ip", { length: 64 }),
	requestedUserAgent: text("requested_user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_booking_client_access_challenge_active").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.emailNormalized.asc().nullsLast().op("timestamptz_ops"), table.expiresAt.desc().nullsFirst().op("uuid_ops")).where(sql`(consumed_at IS NULL)`),
	index("idx_booking_client_access_challenge_lookup").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.emailNormalized.asc().nullsLast().op("uuid_ops"), table.createdAt.desc().nullsFirst().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "booking_client_access_challenge_organization_id_fkey"
		}).onDelete("cascade"),
	check("booking_client_access_challenge_attempts_check", sql`(attempts >= 0) AND (attempts <= max_attempts)`),
	check("booking_client_access_challenge_expiry_check", sql`expires_at > created_at`),
	check("booking_client_access_challenge_max_attempts_check", sql`(max_attempts > 0) AND (max_attempts <= 10)`),
]);

export const bookingClientAccessSession = pgTable("booking_client_access_session", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	emailNormalized: varchar("email_normalized", { length: 320 }).notNull(),
	tokenHash: varchar("token_hash", { length: 128 }).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	idleExpiresAt: timestamp("idle_expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	revokedAt: timestamp("revoked_at", { withTimezone: true, mode: 'string' }),
	createdIp: varchar("created_ip", { length: 64 }),
	createdUserAgent: text("created_user_agent"),
	lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_booking_client_access_session_active").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.emailNormalized.asc().nullsLast().op("text_ops"), table.idleExpiresAt.desc().nullsFirst().op("uuid_ops")).where(sql`(revoked_at IS NULL)`),
	index("idx_booking_client_access_session_lookup").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.emailNormalized.asc().nullsLast().op("uuid_ops"), table.createdAt.desc().nullsFirst().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "booking_client_access_session_organization_id_fkey"
		}).onDelete("cascade"),
	unique("booking_client_access_session_token_hash_key").on(table.tokenHash),
	check("booking_client_access_session_expiry_check", sql`expires_at > created_at`),
	check("booking_client_access_session_idle_expiry_check", sql`idle_expires_at <= expires_at`),
]);

export const servicePriceExtra = pgTable("service_price_extra", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	serviceId: uuid("service_id").notNull(),
	schemaDocId: varchar("schema_doc_id", { length: 255 }),
	isDefault: boolean("is_default").default(false).notNull(),
	amount: numeric().notNull(),
	description: varchar({ length: 255 }).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_service_price_extra_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_service_price_extra_schema_doc_id").using("btree", table.schemaDocId.asc().nullsLast().op("text_ops")),
	index("idx_service_price_extra_service_id").using("btree", table.serviceId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "service_price_extra_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serviceId],
			foreignColumns: [service.id],
			name: "service_price_extra_service_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("service_price_extra_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'service.delete'::org_permission))` }),
	pgPolicy("service_price_extra_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("service_price_extra_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("service_price_extra_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const bookingCommunicationThread = pgTable("booking_communication_thread", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	bookingId: uuid("booking_id").notNull(),
	channel: varchar({ length: 20 }).notNull(),
	participantKey: varchar("participant_key", { length: 320 }).notNull(),
	providerThreadKey: varchar("provider_thread_key", { length: 255 }),
	lastMessageAt: timestamp("last_message_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_booking_communication_thread_booking_channel").using("btree", table.bookingId.asc().nullsLast().op("text_ops"), table.channel.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_communication_thread_booking_id").using("btree", table.bookingId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_communication_thread_last_message_at").using("btree", table.lastMessageAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_booking_communication_thread_org_channel").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.channel.asc().nullsLast().op("text_ops")),
	index("idx_booking_communication_thread_org_channel_last_activity").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.channel.asc().nullsLast().op("uuid_ops"), table.lastMessageAt.desc().nullsFirst().op("text_ops"), table.createdAt.desc().nullsFirst().op("text_ops")),
	index("idx_booking_communication_thread_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [booking.id],
			name: "booking_communication_thread_booking_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "booking_communication_thread_organization_id_fkey"
		}).onDelete("cascade"),
	unique("uq_booking_communication_thread_booking_channel_participant").on(table.bookingId, table.channel, table.participantKey),
	pgPolicy("booking_communication_thread_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'booking.delete'::org_permission))` }),
	pgPolicy("booking_communication_thread_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("booking_communication_thread_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("booking_communication_thread_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
	check("booking_communication_thread_channel_check", sql`(channel)::text = ANY ((ARRAY['email'::character varying, 'sms'::character varying])::text[])`),
]);

export const bookingCommunicationMessage = pgTable("booking_communication_message", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	threadId: uuid("thread_id").notNull(),
	bookingId: uuid("booking_id").notNull(),
	direction: varchar({ length: 20 }).notNull(),
	channel: varchar({ length: 20 }).notNull(),
	status: varchar({ length: 20 }).default('queued').notNull(),
	provider: varchar({ length: 80 }),
	providerMessageId: varchar("provider_message_id", { length: 255 }),
	messageIdRfc: varchar("message_id_rfc", { length: 255 }),
	inReplyToRfc: varchar("in_reply_to_rfc", { length: 255 }),
	sender: varchar({ length: 320 }),
	recipient: varchar({ length: 320 }),
	subject: text(),
	bodyText: text("body_text"),
	bodyHtml: text("body_html"),
	metadata: jsonb().default({}).notNull(),
	sentAt: timestamp("sent_at", { withTimezone: true, mode: 'string' }),
	receivedAt: timestamp("received_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_booking_communication_message_booking_channel_created_at").using("btree", table.bookingId.asc().nullsLast().op("uuid_ops"), table.channel.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("uuid_ops")),
	index("idx_booking_communication_message_booking_created_at").using("btree", table.bookingId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("uuid_ops")),
	index("idx_booking_communication_message_booking_id").using("btree", table.bookingId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_communication_message_in_reply_to_rfc").using("btree", table.inReplyToRfc.asc().nullsLast().op("text_ops")),
	index("idx_booking_communication_message_message_id_rfc").using("btree", table.messageIdRfc.asc().nullsLast().op("text_ops")),
	index("idx_booking_communication_message_org_channel_created_at").using("btree", table.organizationId.asc().nullsLast().op("timestamptz_ops"), table.channel.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_booking_communication_message_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_communication_message_provider_message_id").using("btree", table.providerMessageId.asc().nullsLast().op("text_ops")),
	index("idx_booking_communication_message_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_booking_communication_message_thread_created_at").using("btree", table.threadId.asc().nullsLast().op("uuid_ops"), table.createdAt.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_communication_message_thread_id").using("btree", table.threadId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("uq_booking_communication_message_provider_message").using("btree", table.provider.asc().nullsLast().op("text_ops"), table.providerMessageId.asc().nullsLast().op("text_ops")).where(sql`(provider_message_id IS NOT NULL)`),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [booking.id],
			name: "booking_communication_message_booking_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "booking_communication_message_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.threadId],
			foreignColumns: [bookingCommunicationThread.id],
			name: "booking_communication_message_thread_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("booking_communication_message_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'booking.delete'::org_permission))` }),
	pgPolicy("booking_communication_message_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("booking_communication_message_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("booking_communication_message_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
	check("booking_communication_message_channel_check", sql`(channel)::text = ANY ((ARRAY['email'::character varying, 'sms'::character varying])::text[])`),
	check("booking_communication_message_direction_check", sql`(direction)::text = ANY ((ARRAY['outbound'::character varying, 'inbound'::character varying])::text[])`),
	check("booking_communication_message_status_check", sql`(status)::text = ANY ((ARRAY['queued'::character varying, 'sent'::character varying, 'delivered'::character varying, 'failed'::character varying, 'bounced'::character varying, 'complained'::character varying, 'opened'::character varying, 'clicked'::character varying, 'replied'::character varying, 'received'::character varying, 'skipped'::character varying])::text[])`),
]);

export const bookingCommunicationStatusEvent = pgTable("booking_communication_status_event", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	messageId: uuid("message_id").notNull(),
	bookingId: uuid("booking_id").notNull(),
	eventType: varchar("event_type", { length: 30 }).notNull(),
	provider: varchar({ length: 80 }),
	providerEventId: varchar("provider_event_id", { length: 255 }),
	eventAt: timestamp("event_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	error: text(),
	payload: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_booking_communication_status_event_booking_event_at").using("btree", table.bookingId.asc().nullsLast().op("timestamptz_ops"), table.eventAt.desc().nullsFirst().op("uuid_ops")),
	index("idx_booking_communication_status_event_booking_id").using("btree", table.bookingId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_communication_status_event_message_event_at").using("btree", table.messageId.asc().nullsLast().op("timestamptz_ops"), table.eventAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_booking_communication_status_event_message_id").using("btree", table.messageId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_communication_status_event_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_booking_communication_status_event_provider_event_id").using("btree", table.providerEventId.asc().nullsLast().op("text_ops")),
	uniqueIndex("uq_booking_communication_status_event_provider_event").using("btree", table.provider.asc().nullsLast().op("text_ops"), table.providerEventId.asc().nullsLast().op("text_ops")).where(sql`(provider_event_id IS NOT NULL)`),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [booking.id],
			name: "booking_communication_status_event_booking_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [bookingCommunicationMessage.id],
			name: "booking_communication_status_event_message_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "booking_communication_status_event_organization_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("booking_communication_status_event_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'booking.delete'::org_permission))` }),
	pgPolicy("booking_communication_status_event_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("booking_communication_status_event_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("booking_communication_status_event_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
	check("booking_communication_status_event_event_type_check", sql`(event_type)::text = ANY ((ARRAY['queued'::character varying, 'sent'::character varying, 'delivered'::character varying, 'failed'::character varying, 'bounced'::character varying, 'complained'::character varying, 'opened'::character varying, 'clicked'::character varying, 'replied'::character varying, 'received'::character varying, 'provider_update'::character varying, 'skipped'::character varying])::text[])`),
]);

export const organizationDiscountCode = pgTable("organization_discount_code", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	name: varchar({ length: 160 }).notNull(),
	code: varchar({ length: 32 }).notNull(),
	codeNormalized: varchar("code_normalized", { length: 32 }).notNull(),
	type: discountType().notNull(),
	percentageAmount: numeric("percentage_amount", { precision: 5, scale:  2 }),
	fixedAmount: numeric("fixed_amount", { precision: 12, scale:  2 }),
	expiresOn: date("expires_on"),
	maxTotalUses: integer("max_total_uses"),
	limitPerEmail: boolean("limit_per_email").default(true).notNull(),
	active: boolean().default(true).notNull(),
	metadata: jsonb().default({}).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_org_discount_code_org_active_expires").using("btree", table.organizationId.asc().nullsLast().op("date_ops"), table.active.asc().nullsLast().op("uuid_ops"), table.expiresOn.asc().nullsLast().op("uuid_ops")),
	index("idx_organization_discount_code_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("uq_org_discount_code_org_code_normalized").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.codeNormalized.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "organization_discount_code_organization_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("organization_discount_code_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'setting.manage'::org_permission))` }),
	pgPolicy("organization_discount_code_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("organization_discount_code_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("organization_discount_code_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
	check("chk_discount_code_format", sql`(code_normalized)::text ~ '^[A-Z0-9-]{4,32}$'::text`),
	check("chk_discount_fixed_amount", sql`(fixed_amount IS NULL) OR (fixed_amount >= (0)::numeric)`),
	check("chk_discount_max_total_uses", sql`(max_total_uses IS NULL) OR (max_total_uses > 0)`),
	check("chk_discount_percentage_amount", sql`(percentage_amount IS NULL) OR ((percentage_amount > (0)::numeric) AND (percentage_amount <= (100)::numeric))`),
	check("chk_discount_type_amount", sql`((type = 'percentage'::discount_type) AND (percentage_amount IS NOT NULL) AND (fixed_amount IS NULL)) OR ((type = 'fixed'::discount_type) AND (fixed_amount IS NOT NULL) AND (percentage_amount IS NULL))`),
]);

export const organizationDiscountCodeRedemption = pgTable("organization_discount_code_redemption", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	discountCodeId: uuid("discount_code_id").notNull(),
	bookingId: uuid("booking_id"),
	normalizedEmail: varchar("normalized_email", { length: 320 }),
	status: discountRedemptionStatus().default('reserved').notNull(),
	discountAmount: numeric("discount_amount", { precision: 12, scale:  2 }).default('0').notNull(),
	reservedUntil: timestamp("reserved_until", { withTimezone: true, mode: 'string' }),
	consumedAt: timestamp("consumed_at", { withTimezone: true, mode: 'string' }),
	releasedAt: timestamp("released_at", { withTimezone: true, mode: 'string' }),
	releaseReason: varchar("release_reason", { length: 120 }),
	metadata: jsonb().default({}).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_org_discount_redemption_org_discount_email_status").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.discountCodeId.asc().nullsLast().op("enum_ops"), table.normalizedEmail.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("enum_ops")),
	index("idx_org_discount_redemption_org_discount_status_reserved").using("btree", table.organizationId.asc().nullsLast().op("timestamptz_ops"), table.discountCodeId.asc().nullsLast().op("timestamptz_ops"), table.status.asc().nullsLast().op("uuid_ops"), table.reservedUntil.asc().nullsLast().op("timestamptz_ops")),
	index("idx_organization_discount_code_redemption_discount_code_id").using("btree", table.discountCodeId.asc().nullsLast().op("uuid_ops")),
	index("idx_organization_discount_code_redemption_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_organization_discount_code_redemption_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	uniqueIndex("uq_org_discount_redemption_booking").using("btree", table.bookingId.asc().nullsLast().op("uuid_ops")).where(sql`(booking_id IS NOT NULL)`),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [booking.id],
			name: "organization_discount_code_redemption_booking_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.discountCodeId],
			foreignColumns: [organizationDiscountCode.id],
			name: "organization_discount_code_redemption_discount_code_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "organization_discount_code_redemption_organization_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("organization_discount_code_redemption_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'setting.manage'::org_permission))` }),
	pgPolicy("organization_discount_code_redemption_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("organization_discount_code_redemption_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("organization_discount_code_redemption_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
	check("chk_discount_redemption_discount_amount", sql`discount_amount >= (0)::numeric`),
	check("chk_discount_redemption_email_normalized", sql`(normalized_email IS NULL) OR ((normalized_email)::text = lower(TRIM(BOTH FROM normalized_email)))`),
	check("chk_discount_redemption_status_timestamps", sql`((status = 'reserved'::discount_redemption_status) AND (reserved_until IS NOT NULL) AND (consumed_at IS NULL)) OR ((status = 'consumed'::discount_redemption_status) AND (consumed_at IS NOT NULL)) OR ((status = 'released'::discount_redemption_status) AND (released_at IS NOT NULL))`),
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
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "service_participant_data_schema_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.participantDataSchemaId],
			foreignColumns: [participantDataSchema.id],
			name: "service_participant_data_schema_participant_data_schema_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serviceId],
			foreignColumns: [service.id],
			name: "service_participant_data_schema_service_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.serviceId, table.participantDataSchemaId], name: "service_participant_data_schema_pkey"}),
	pgPolicy("service_participant_data_schema_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'service.delete'::org_permission))` }),
	pgPolicy("service_participant_data_schema_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("service_participant_data_schema_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("service_participant_data_schema_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const serviceTaxAssignment = pgTable("service_tax_assignment", {
	organizationId: uuid("organization_id").notNull(),
	serviceId: uuid("service_id").notNull(),
	taxId: uuid("tax_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_service_tax_assignment_org_service").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.serviceId.asc().nullsLast().op("uuid_ops")),
	index("idx_service_tax_assignment_tax").using("btree", table.taxId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "service_tax_assignment_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serviceId],
			foreignColumns: [service.id],
			name: "service_tax_assignment_service_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.taxId],
			foreignColumns: [organizationTax.id],
			name: "service_tax_assignment_tax_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.serviceId, table.taxId], name: "service_tax_assignment_pkey"}),
	pgPolicy("service_tax_assignment_delete", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'service.update'::org_permission))` }),
	pgPolicy("service_tax_assignment_insert", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("service_tax_assignment_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("service_tax_assignment_update", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const invoiceCounter = pgTable("invoice_counter", {
	organizationId: uuid("organization_id").notNull(),
	year: integer().notNull(),
	lastValue: integer("last_value").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_planoby_invoice_counter_org").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "invoice_counter_organization_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.organizationId, table.year], name: "planoby_invoice_counter_pkey"}),
	pgPolicy("planoby_invoice_counter_delete", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'booking.delete'::org_permission))` }),
	pgPolicy("planoby_invoice_counter_insert", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("planoby_invoice_counter_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("planoby_invoice_counter_update", { as: "permissive", for: "update", to: ["authenticated"] }),
	check("chk_planoby_invoice_counter_last_value", sql`last_value >= 0`),
	check("chk_planoby_invoice_counter_year", sql`year >= 2000`),
]);

export const organizationDiscountCodeService = pgTable("organization_discount_code_service", {
	organizationId: uuid("organization_id").notNull(),
	discountCodeId: uuid("discount_code_id").notNull(),
	serviceId: uuid("service_id").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_org_discount_code_service_org_discount").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.discountCodeId.asc().nullsLast().op("uuid_ops")),
	index("idx_org_discount_code_service_org_service").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.serviceId.asc().nullsLast().op("uuid_ops")),
	index("idx_organization_discount_code_service_discount_code_id").using("btree", table.discountCodeId.asc().nullsLast().op("uuid_ops")),
	index("idx_organization_discount_code_service_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("idx_organization_discount_code_service_service_id").using("btree", table.serviceId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.discountCodeId],
			foreignColumns: [organizationDiscountCode.id],
			name: "organization_discount_code_service_discount_code_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "organization_discount_code_service_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serviceId],
			foreignColumns: [service.id],
			name: "organization_discount_code_service_service_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.discountCodeId, table.serviceId], name: "organization_discount_code_service_pkey"}),
	pgPolicy("organization_discount_code_service_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'setting.manage'::org_permission))` }),
	pgPolicy("organization_discount_code_service_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("organization_discount_code_service_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("organization_discount_code_service_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const servicePriceMatrixCell = pgTable("service_price_matrix_cell", {
	organizationId: uuid("organization_id").notNull(),
	matrixId: uuid("matrix_id").notNull(),
	rowIndex: integer("row_index").notNull(),
	colIndex: integer("col_index").notNull(),
	amount: numeric().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_service_price_matrix_cell_matrix_id").using("btree", table.matrixId.asc().nullsLast().op("uuid_ops")),
	index("idx_service_price_matrix_cell_organization_id").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.matrixId],
			foreignColumns: [servicePriceMatrix.id],
			name: "service_price_matrix_cell_matrix_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "service_price_matrix_cell_organization_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.matrixId, table.rowIndex, table.colIndex], name: "service_price_matrix_cell_pkey"}),
	pgPolicy("service_price_matrix_cell_delete_3", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'service.delete'::org_permission))` }),
	pgPolicy("service_price_matrix_cell_insert_1", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("service_price_matrix_cell_select", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("service_price_matrix_cell_update_2", { as: "permissive", for: "update", to: ["authenticated"] }),
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
}).as(sql`SELECT so.id AS slot_occurrence_id, so.organization_id, so.company_member_id AS organization_member_id, so.date, so.start_at, so.end_at, so.state, so.visible, so.slot_id, so.service_id, s.name AS service_name, s.calendar_color AS service_calendar_color, s.duration AS service_duration, COALESCE(jsonb_agg(jsonb_build_object('id', b.id, 'relative_id', b.relative_id, 'state', b.state, 'firstname', b.firstname, 'lastname', b.lastname, 'email', b.email, 'phone', b.phone, 'participants', b.participants, 'customer_note', b.customer_note, 'start_at', b.start_at, 'end_at', b.end_at) ORDER BY b.start_at, b.created_at) FILTER (WHERE b.id IS NOT NULL), '[]'::jsonb) AS bookings FROM slot_occurrence so LEFT JOIN service s ON s.id = so.service_id LEFT JOIN booking b ON b.slot_occurrence_id = so.id GROUP BY so.id, so.organization_id, so.company_member_id, so.date, so.start_at, so.end_at, so.state, so.visible, so.slot_id, so.service_id, s.name, s.calendar_color, s.duration`);
