import { sql } from 'drizzle-orm';
import {
    boolean,
    check,
    foreignKey,
    index,
    integer,
    json,
    jsonb,
    numeric,
    pgEnum,
    pgPolicy,
    pgTable,
    text,
    timestamp,
    unique,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';

import { authUsers as users } from 'drizzle-orm/supabase';
export const usersInAuth = users;

export const aiThreadStatus = pgEnum('ai_thread_status', ['regular', 'archived']);
export const notificationType = pgEnum('notification_type', ['info', 'warning', 'error', 'success']);
export const orderStatus = pgEnum('order_status', ['pending', 'confirmed', 'completed', 'cancelled']);
export const orgPermission = pgEnum('org_permission', [
    'role.manage',
    'organization.manage',
    'member.manage',
    'invitation.manage',
    'setting.manage',
    'media.manage',
]);

export const user = pgTable(
    'user',
    {
        id: uuid().default(sql`auth.uid()`).primaryKey().notNull(),
        authUserId: uuid('auth_user_id').default(sql`auth.uid()`).notNull(),
        name: varchar({ length: 255 }).notNull(),
        email: varchar({ length: 320 }),
        profileUrl: varchar('profile_url', { length: 1000 }),
        phone: varchar(),
        completedOnboarding: boolean('completed_onboarding').default(false).notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.authUserId],
            foreignColumns: [users.id],
            name: 'user_auth_user_id_fkey',
        }).onDelete('cascade'),
        pgPolicy('user_create', {
            as: 'permissive',
            for: 'insert',
            to: ['authenticated'],
            withCheck: sql`(( SELECT auth.uid() AS uid) = auth_user_id)`,
        }),
        pgPolicy('user_delete', { as: 'permissive', for: 'delete', to: ['authenticated'] }),
        pgPolicy('user_read', { as: 'permissive', for: 'select', to: ['authenticated'] }),
        pgPolicy('user_update', { as: 'permissive', for: 'update', to: ['authenticated'] }),
    ],
);

export const userSetting = pgTable(
    'user_setting',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        userId: uuid('user_id').notNull(),
        name: varchar({ length: 255 }).notNull(),
        value: json().default({ json: null }).notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: 'user_setting_user_id_fkey',
        }).onDelete('cascade'),
        pgPolicy('user_setting_all', {
            as: 'permissive',
            for: 'all',
            to: ['authenticated'],
            using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = user_setting.user_id) AND ("user".auth_user_id = auth.uid()))))`,
            withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = user_setting.user_id) AND ("user".auth_user_id = auth.uid()))))`,
        }),
    ],
);

export const subscription = pgTable(
    'subscription',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        userId: uuid('user_id').notNull(),
        stripeSubscriptionId: text('stripe_subscription_id').notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: 'subscription_user_id_fkey',
        }).onDelete('cascade'),
        unique('subscription_stripe_subscription_id_key').on(table.stripeSubscriptionId),
        pgPolicy('subscription_all', {
            as: 'permissive',
            for: 'all',
            to: ['authenticated'],
            using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = subscription.user_id) AND ("user".auth_user_id = auth.uid()))))`,
            withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = subscription.user_id) AND ("user".auth_user_id = auth.uid()))))`,
        }),
    ],
);

export const aiThread = pgTable(
    'ai_thread',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        userId: uuid('user_id').notNull(),
        title: text(),
        status: aiThreadStatus().default('regular').notNull(),
        externalId: text('external_id'),
        metadata: jsonb().default({}).notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: 'ai_thread_user_id_fkey',
        }).onDelete('cascade'),
        pgPolicy('ai_thread_all', {
            as: 'permissive',
            for: 'all',
            to: ['authenticated'],
            using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_thread.user_id) AND ("user".auth_user_id = auth.uid()))))`,
            withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_thread.user_id) AND ("user".auth_user_id = auth.uid()))))`,
        }),
    ],
);

export const aiMessage = pgTable(
    'ai_message',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        userId: uuid('user_id').notNull(),
        threadId: uuid('thread_id').notNull(),
        role: text().notNull(),
        content: text().notNull(),
        toolName: text('tool_name'),
        toolInput: jsonb('tool_input'),
        tokensUsed: integer('tokens_used'),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: 'ai_message_user_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.threadId],
            foreignColumns: [aiThread.id],
            name: 'ai_message_thread_id_fkey',
        }).onDelete('cascade'),
        pgPolicy('ai_message_all', {
            as: 'permissive',
            for: 'all',
            to: ['authenticated'],
            using: sql`(EXISTS ( SELECT 1
   FROM (ai_thread t
     JOIN "user" u ON ((u.id = t.user_id)))
  WHERE ((t.id = ai_message.thread_id) AND (u.auth_user_id = auth.uid()))))`,
            withCheck: sql`(EXISTS ( SELECT 1
   FROM (ai_thread t
     JOIN "user" u ON ((u.id = t.user_id)))
  WHERE ((t.id = ai_message.thread_id) AND (u.auth_user_id = auth.uid()))))`,
        }),
        check(
            'ai_message_role_check',
            sql`role = ANY (ARRAY['user'::text, 'assistant'::text, 'tool'::text, 'system'::text])`,
        ),
    ],
);

export const usageRecord = pgTable(
    'usage_record',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        userId: uuid('user_id').notNull(),
        subscriptionId: uuid('subscription_id').notNull(),
        tokensUsed: integer('tokens_used').notNull(),
        actionType: text('action_type').notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: 'usage_record_user_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.subscriptionId],
            foreignColumns: [subscription.id],
            name: 'usage_record_subscription_id_fkey',
        }).onDelete('cascade'),
        pgPolicy('usage_record_all', {
            as: 'permissive',
            for: 'all',
            to: ['authenticated'],
            using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = usage_record.user_id) AND ("user".auth_user_id = auth.uid()))))`,
            withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = usage_record.user_id) AND ("user".auth_user_id = auth.uid()))))`,
        }),
    ],
);

export const aiUsage = pgTable(
    'ai_usage',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        userId: uuid('user_id').notNull(),
        inputTokens: integer('input_tokens').default(0).notNull(),
        outputTokens: integer('output_tokens').default(0).notNull(),
        reasoningTokens: integer('reasoning_tokens').default(0).notNull(),
        cachedInputTokens: integer('cached_input_tokens').default(0).notNull(),
        modelId: text('model_id').notNull(),
        cost: numeric({ precision: 10, scale: 6 }).default('0').notNull(),
        aiTimestamp: timestamp('ai_timestamp', { withTimezone: true, mode: 'string' }).notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: 'ai_usage_user_id_fkey',
        }).onDelete('cascade'),
        pgPolicy('ai_usage_all', {
            as: 'permissive',
            for: 'all',
            to: ['authenticated'],
            using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_usage.user_id) AND ("user".auth_user_id = auth.uid()))))`,
            withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_usage.user_id) AND ("user".auth_user_id = auth.uid()))))`,
        }),
    ],
);

export const aiWallet = pgTable(
    'ai_wallet',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        userId: uuid('user_id').notNull(),
        balance: numeric({ precision: 10, scale: 6 }).default('0').notNull(),
        currency: varchar({ length: 3 }).default('USD').notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        index('idx_ai_wallet_user_id').using('btree', table.userId.asc().nullsLast().op('uuid_ops')),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: 'ai_wallet_user_id_fkey',
        }).onDelete('cascade'),
        unique('ai_wallet_user_id_key').on(table.userId),
        pgPolicy('ai_wallet_all', {
            as: 'permissive',
            for: 'all',
            to: ['authenticated'],
            using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_wallet.user_id) AND ("user".auth_user_id = auth.uid()))))`,
            withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_wallet.user_id) AND ("user".auth_user_id = auth.uid()))))`,
        }),
    ],
);

export const aiWalletTransaction = pgTable(
    'ai_wallet_transaction',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        userId: uuid('user_id').notNull(),
        walletId: uuid('wallet_id').notNull(),
        amount: numeric({ precision: 10, scale: 6 }).notNull(),
        type: varchar({ length: 50 }).notNull(),
        description: text(),
        balanceAfter: numeric('balance_after', { precision: 10, scale: 6 }).notNull(),
        metadata: jsonb(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        index('idx_ai_wallet_transaction_created_at').using(
            'btree',
            table.createdAt.desc().nullsFirst().op('timestamptz_ops'),
        ),
        index('idx_ai_wallet_transaction_type').using('btree', table.type.asc().nullsLast().op('text_ops')),
        index('idx_ai_wallet_transaction_user_id').using('btree', table.userId.asc().nullsLast().op('uuid_ops')),
        index('idx_ai_wallet_transaction_wallet_id').using('btree', table.walletId.asc().nullsLast().op('uuid_ops')),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: 'ai_wallet_transaction_user_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.walletId],
            foreignColumns: [aiWallet.id],
            name: 'ai_wallet_transaction_wallet_id_fkey',
        }).onDelete('cascade'),
        pgPolicy('ai_wallet_transaction_all', {
            as: 'permissive',
            for: 'all',
            to: ['authenticated'],
            using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_wallet_transaction.user_id) AND ("user".auth_user_id = auth.uid()))))`,
            withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = ai_wallet_transaction.user_id) AND ("user".auth_user_id = auth.uid()))))`,
        }),
        check(
            'ai_wallet_transaction_type_check',
            sql`(type)::text = ANY ((ARRAY['deposit'::character varying, 'usage'::character varying, 'refund'::character varying, 'adjustment'::character varying])::text[])`,
        ),
    ],
);

export const organization = pgTable(
    'organization',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        name: varchar({ length: 255 }).notNull(),
        slug: text().notNull(),
        address: varchar(),
        email: varchar({ length: 320 }),
        website: varchar({ length: 320 }),
        logoUrl: varchar('logo_url', { length: 1000 }),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        unique('organization_slug_key').on(table.slug),
        unique('organization_email_key').on(table.email),
        pgPolicy('organization_create', {
            as: 'permissive',
            for: 'insert',
            to: ['authenticated'],
            withCheck: sql`true`,
        }),
        pgPolicy('organization_delete', { as: 'permissive', for: 'delete', to: ['authenticated'] }),
        pgPolicy('organization_read', { as: 'permissive', for: 'select', to: ['authenticated'] }),
        pgPolicy('organization_update', { as: 'permissive', for: 'update', to: ['authenticated'] }),
    ],
);

export const organizationRole = pgTable(
    'organization_role',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        name: varchar({ length: 100 }).notNull(),
        hierarchyLevel: integer('hierarchy_level').notNull(),
        organizationId: uuid('organization_id').notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organization.id],
            name: 'organization_role_organization_id_fkey',
        }).onDelete('cascade'),
        unique('organization_role_name_organization_id_key').on(table.name, table.organizationId),
        pgPolicy('organization_role_delete', {
            as: 'permissive',
            for: 'delete',
            to: ['authenticated'],
            using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'role.manage'::org_permission))`,
        }),
        pgPolicy('organization_role_insert', { as: 'permissive', for: 'insert', to: ['authenticated'] }),
        pgPolicy('organization_role_read', { as: 'permissive', for: 'select', to: ['authenticated'] }),
        pgPolicy('organization_role_update', { as: 'permissive', for: 'update', to: ['authenticated'] }),
    ],
);

export const organizationRolePermission = pgTable(
    'organization_role_permission',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        roleId: uuid('role_id').notNull(),
        organizationId: uuid('organization_id').notNull(),
        permission: orgPermission().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.roleId],
            foreignColumns: [organizationRole.id],
            name: 'organization_role_permission_role_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organization.id],
            name: 'organization_role_permission_organization_id_fkey',
        }).onDelete('cascade'),
        unique('organization_role_permission_role_id_permission_key').on(table.roleId, table.permission),
        pgPolicy('organization_role_permission_delete', {
            as: 'permissive',
            for: 'delete',
            to: ['authenticated'],
            using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'role.manage'::org_permission) AND ((permission <> 'role.manage'::org_permission) OR (kit.has_multiple_role_manage_permissions(organization_id) AND (EXISTS ( SELECT 1
   FROM (organization_member om
     JOIN organization_role_permission orp ON ((orp.role_id = om.role_id)))
  WHERE ((om.organization_id = organization_role_permission.organization_id) AND (orp.permission = 'role.manage'::org_permission) AND (om.role_id <> organization_role_permission.role_id)))))))`,
        }),
        pgPolicy('organization_role_permission_insert', { as: 'permissive', for: 'insert', to: ['authenticated'] }),
        pgPolicy('organization_role_permission_read', { as: 'permissive', for: 'select', to: ['authenticated'] }),
        pgPolicy('organization_role_permission_update', { as: 'permissive', for: 'update', to: ['authenticated'] }),
    ],
);

export const organizationMember = pgTable(
    'organization_member',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        isOwner: boolean('is_owner').default(false).notNull(),
        roleId: uuid('role_id').notNull(),
        userId: uuid('user_id').notNull(),
        organizationId: uuid('organization_id').notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.roleId],
            foreignColumns: [organizationRole.id],
            name: 'organization_member_role_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: 'organization_member_user_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organization.id],
            name: 'organization_member_organization_id_fkey',
        }).onDelete('cascade'),
        unique('organization_member_user_id_organization_id_key').on(table.userId, table.organizationId),
        pgPolicy('organization_member_create', {
            as: 'permissive',
            for: 'insert',
            to: ['authenticated'],
            withCheck: sql`kit.user_is_invited_to_org(organization_id)`,
        }),
        pgPolicy('organization_member_delete', { as: 'permissive', for: 'delete', to: ['authenticated'] }),
        pgPolicy('organization_member_read', { as: 'permissive', for: 'select', to: ['authenticated'] }),
        pgPolicy('organization_member_update', { as: 'permissive', for: 'update', to: ['authenticated'] }),
    ],
);

export const organizationInvitation = pgTable(
    'organization_invitation',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        email: varchar({ length: 320 }).notNull(),
        organizationId: uuid('organization_id').notNull(),
        roleId: uuid('role_id').notNull(),
        inviteToken: uuid('invite_token').defaultRandom().notNull(),
        invitedBy: uuid('invited_by').default(sql`auth.uid()`).notNull(),
        expiresAt: timestamp('expires_at', { mode: 'string' }).default(sql`(now() + '7 days'::interval)`).notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organization.id],
            name: 'organization_invitation_organization_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.roleId],
            foreignColumns: [organizationRole.id],
            name: 'organization_invitation_role_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.invitedBy],
            foreignColumns: [user.id],
            name: 'organization_invitation_invited_by_fkey',
        }).onDelete('cascade'),
        unique('organization_invitation_email_organization_id_key').on(table.email, table.organizationId),
        unique('organization_invitation_invite_token_key').on(table.inviteToken),
        pgPolicy('organization_invitation_create', {
            as: 'permissive',
            for: 'insert',
            to: ['authenticated'],
            withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'invitation.manage'::org_permission))`,
        }),
        pgPolicy('organization_invitation_delete', { as: 'permissive', for: 'delete', to: ['authenticated'] }),
        pgPolicy('organization_invitation_read', { as: 'permissive', for: 'select', to: ['authenticated'] }),
        pgPolicy('organization_invitation_update', { as: 'permissive', for: 'update', to: ['authenticated'] }),
    ],
);

export const organizationSetting = pgTable(
    'organization_setting',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        organizationId: uuid('organization_id').notNull(),
        name: varchar({ length: 255 }).notNull(),
        value: json().default({ json: null }).notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organization.id],
            name: 'organization_setting_organization_id_fkey',
        }).onDelete('cascade'),
        pgPolicy('organization_setting_all', {
            as: 'permissive',
            for: 'all',
            to: ['authenticated'],
            using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'setting.manage'::org_permission))`,
            withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'setting.manage'::org_permission))`,
        }),
    ],
);

export const notification = pgTable(
    'notification',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        userId: uuid('user_id').notNull(),
        type: notificationType().default('info').notNull(),
        imageUrl: varchar('image_url', { length: 1000 }),
        icon: varchar({ length: 320 }),
        read: boolean().default(false).notNull(),
        title: varchar({ length: 320 }).notNull(),
        body: varchar().notNull(),
        data: jsonb(),
        iosSubtitle: varchar('ios_subtitle', { length: 320 }),
        iosBadgeCount: integer('ios_badge_count'),
        iosSoundName: varchar('ios_sound_name', { length: 320 }),
        androidChannelId: varchar('android_channel_id', { length: 320 }),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        organizationId: uuid('organization_id'),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: 'notification_user_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organization.id],
            name: 'notification_organization_id_fkey',
        }).onDelete('cascade'),
        pgPolicy('notification_all', {
            as: 'permissive',
            for: 'all',
            to: ['authenticated'],
            using: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = notification.user_id) AND ("user".auth_user_id = auth.uid()))))`,
            withCheck: sql`(EXISTS ( SELECT 1
   FROM "user"
  WHERE (("user".id = notification.user_id) AND ("user".auth_user_id = auth.uid()))))`,
        }),
    ],
);

export const product = pgTable(
    'product',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        organizationId: uuid('organization_id').notNull(),
        name: varchar({ length: 255 }).notNull(),
        description: text(),
        imageUrl: varchar('image_url', { length: 500 }),
        price: numeric({ precision: 10, scale: 2 }).notNull(),
        currency: varchar({ length: 3 }).default('USD').notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organization.id],
            name: 'product_organization_id_fkey',
        }).onDelete('cascade'),
        pgPolicy('product_all', {
            as: 'permissive',
            for: 'all',
            to: ['authenticated'],
            using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`,
            withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`,
        }),
    ],
);

export const client = pgTable(
    'client',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        organizationId: uuid('organization_id').notNull(),
        name: varchar({ length: 255 }).notNull(),
        email: varchar({ length: 320 }),
        phone: varchar({ length: 50 }),
        address: text(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organization.id],
            name: 'client_organization_id_fkey',
        }).onDelete('cascade'),
        pgPolicy('client_all', {
            as: 'permissive',
            for: 'all',
            to: ['authenticated'],
            using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`,
            withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`,
        }),
    ],
);

export const order = pgTable(
    'order',
    {
        id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
        organizationId: uuid('organization_id').notNull(),
        clientId: uuid('client_id').notNull(),
        productId: uuid('product_id').notNull(),
        quantity: integer().notNull(),
        totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
        status: orderStatus().default('pending').notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => [
        index('idx_order_client_id').using('btree', table.clientId.asc().nullsLast().op('uuid_ops')),
        index('idx_order_product_id').using('btree', table.productId.asc().nullsLast().op('uuid_ops')),
        index('idx_order_status').using('btree', table.status.asc().nullsLast().op('enum_ops')),
        foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organization.id],
            name: 'order_organization_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.clientId],
            foreignColumns: [client.id],
            name: 'order_client_id_fkey',
        }).onDelete('cascade'),
        foreignKey({
            columns: [table.productId],
            foreignColumns: [product.id],
            name: 'order_product_id_fkey',
        }).onDelete('restrict'),
        pgPolicy('order_all', {
            as: 'permissive',
            for: 'all',
            to: ['authenticated'],
            using: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`,
            withCheck: sql`(kit.user_is_member_of_org(organization_id) AND kit.has_org_permission(organization_id, 'organization.manage'::org_permission))`,
        }),
        pgPolicy('order_create', { as: 'permissive', for: 'insert', to: ['public'] }),
        check('order_quantity_check', sql`quantity > 0`),
    ],
);
