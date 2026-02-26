import { relations } from 'drizzle-orm/relations';
import {
    aiMessage,
    aiThread,
    aiUsage,
    aiWallet,
    aiWalletTransaction,
    client,
    notification,
    order,
    organization,
    organizationInvitation,
    organizationMember,
    organizationRole,
    organizationRolePermission,
    organizationSetting,
    product,
    subscription,
    usageRecord,
    user,
    userSetting,
    usersInAuth,
} from './schema';

export const userRelations = relations(user, ({ one, many }) => ({
    usersInAuth: one(usersInAuth, {
        fields: [user.authUserId],
        references: [usersInAuth.id],
    }),
    userSettings: many(userSetting),
    subscriptions: many(subscription),
    aiThreads: many(aiThread),
    aiMessages: many(aiMessage),
    usageRecords: many(usageRecord),
    aiUsages: many(aiUsage),
    aiWallets: many(aiWallet),
    aiWalletTransactions: many(aiWalletTransaction),
    organizationMembers: many(organizationMember),
    organizationInvitations: many(organizationInvitation),
    notifications: many(notification),
}));

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
    users: many(user),
}));

export const userSettingRelations = relations(userSetting, ({ one }) => ({
    user: one(user, {
        fields: [userSetting.userId],
        references: [user.id],
    }),
}));

export const subscriptionRelations = relations(subscription, ({ one, many }) => ({
    user: one(user, {
        fields: [subscription.userId],
        references: [user.id],
    }),
    usageRecords: many(usageRecord),
}));

export const aiThreadRelations = relations(aiThread, ({ one, many }) => ({
    user: one(user, {
        fields: [aiThread.userId],
        references: [user.id],
    }),
    aiMessages: many(aiMessage),
}));

export const aiMessageRelations = relations(aiMessage, ({ one }) => ({
    user: one(user, {
        fields: [aiMessage.userId],
        references: [user.id],
    }),
    aiThread: one(aiThread, {
        fields: [aiMessage.threadId],
        references: [aiThread.id],
    }),
}));

export const usageRecordRelations = relations(usageRecord, ({ one }) => ({
    user: one(user, {
        fields: [usageRecord.userId],
        references: [user.id],
    }),
    subscription: one(subscription, {
        fields: [usageRecord.subscriptionId],
        references: [subscription.id],
    }),
}));

export const aiUsageRelations = relations(aiUsage, ({ one }) => ({
    user: one(user, {
        fields: [aiUsage.userId],
        references: [user.id],
    }),
}));

export const aiWalletRelations = relations(aiWallet, ({ one, many }) => ({
    user: one(user, {
        fields: [aiWallet.userId],
        references: [user.id],
    }),
    aiWalletTransactions: many(aiWalletTransaction),
}));

export const aiWalletTransactionRelations = relations(aiWalletTransaction, ({ one }) => ({
    user: one(user, {
        fields: [aiWalletTransaction.userId],
        references: [user.id],
    }),
    aiWallet: one(aiWallet, {
        fields: [aiWalletTransaction.walletId],
        references: [aiWallet.id],
    }),
}));

export const organizationRoleRelations = relations(organizationRole, ({ one, many }) => ({
    organization: one(organization, {
        fields: [organizationRole.organizationId],
        references: [organization.id],
    }),
    organizationRolePermissions: many(organizationRolePermission),
    organizationMembers: many(organizationMember),
    organizationInvitations: many(organizationInvitation),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
    organizationRoles: many(organizationRole),
    organizationRolePermissions: many(organizationRolePermission),
    organizationMembers: many(organizationMember),
    organizationInvitations: many(organizationInvitation),
    organizationSettings: many(organizationSetting),
    notifications: many(notification),
    products: many(product),
    clients: many(client),
    orders: many(order),
}));

export const organizationRolePermissionRelations = relations(organizationRolePermission, ({ one }) => ({
    organizationRole: one(organizationRole, {
        fields: [organizationRolePermission.roleId],
        references: [organizationRole.id],
    }),
    organization: one(organization, {
        fields: [organizationRolePermission.organizationId],
        references: [organization.id],
    }),
}));

export const organizationMemberRelations = relations(organizationMember, ({ one }) => ({
    organizationRole: one(organizationRole, {
        fields: [organizationMember.roleId],
        references: [organizationRole.id],
    }),
    user: one(user, {
        fields: [organizationMember.userId],
        references: [user.id],
    }),
    organization: one(organization, {
        fields: [organizationMember.organizationId],
        references: [organization.id],
    }),
}));

export const organizationInvitationRelations = relations(organizationInvitation, ({ one }) => ({
    organization: one(organization, {
        fields: [organizationInvitation.organizationId],
        references: [organization.id],
    }),
    organizationRole: one(organizationRole, {
        fields: [organizationInvitation.roleId],
        references: [organizationRole.id],
    }),
    user: one(user, {
        fields: [organizationInvitation.invitedBy],
        references: [user.id],
    }),
}));

export const organizationSettingRelations = relations(organizationSetting, ({ one }) => ({
    organization: one(organization, {
        fields: [organizationSetting.organizationId],
        references: [organization.id],
    }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
    user: one(user, {
        fields: [notification.userId],
        references: [user.id],
    }),
    organization: one(organization, {
        fields: [notification.organizationId],
        references: [organization.id],
    }),
}));

export const productRelations = relations(product, ({ one, many }) => ({
    organization: one(organization, {
        fields: [product.organizationId],
        references: [organization.id],
    }),
    orders: many(order),
}));

export const clientRelations = relations(client, ({ one, many }) => ({
    organization: one(organization, {
        fields: [client.organizationId],
        references: [organization.id],
    }),
    orders: many(order),
}));

export const orderRelations = relations(order, ({ one }) => ({
    organization: one(organization, {
        fields: [order.organizationId],
        references: [organization.id],
    }),
    client: one(client, {
        fields: [order.clientId],
        references: [client.id],
    }),
    product: one(product, {
        fields: [order.productId],
        references: [product.id],
    }),
}));
