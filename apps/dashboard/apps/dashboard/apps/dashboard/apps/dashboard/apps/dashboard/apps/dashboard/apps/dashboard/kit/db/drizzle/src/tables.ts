import { InferSelectModel } from 'drizzle-orm';
import * as schema from './drizzle/schema';

export type User = InferSelectModel<typeof schema.user>;
export type UserSetting = InferSelectModel<typeof schema.userSetting>;
export type Subscription = InferSelectModel<typeof schema.subscription>;
export type AiThread = InferSelectModel<typeof schema.aiThread>;
export type AiMessage = InferSelectModel<typeof schema.aiMessage>;
export type UsageRecord = InferSelectModel<typeof schema.usageRecord>;
export type AiUsage = InferSelectModel<typeof schema.aiUsage>;
export type AiWallet = InferSelectModel<typeof schema.aiWallet>;
export type AiWalletTransaction = InferSelectModel<typeof schema.aiWalletTransaction>;
export type Organization = InferSelectModel<typeof schema.organization>;
export type OrganizationRole = InferSelectModel<typeof schema.organizationRole>;
export type OrganizationRolePermission = InferSelectModel<typeof schema.organizationRolePermission>;
export type OrganizationMember = InferSelectModel<typeof schema.organizationMember>;
export type OrganizationInvitation = InferSelectModel<typeof schema.organizationInvitation>;
export type OrganizationSetting = InferSelectModel<typeof schema.organizationSetting>;
export type Notification = InferSelectModel<typeof schema.notification>;
export type Product = InferSelectModel<typeof schema.product>;
export type Client = InferSelectModel<typeof schema.client>;
export type Order = InferSelectModel<typeof schema.order>;

// Enum Types
export type AiThreadStatusEnum = (typeof schema.aiThreadStatus.enumValues)[number];
export type NotificationTypeEnum = (typeof schema.notificationType.enumValues)[number];
export type OrderStatusEnum = (typeof schema.orderStatus.enumValues)[number];
export type OrgPermissionEnum = (typeof schema.orgPermission.enumValues)[number];

// Table Schema Map for Dynamic Access
export const tableSchemaMap = {
    user: schema.user,
    user_setting: schema.userSetting,
    subscription: schema.subscription,
    ai_thread: schema.aiThread,
    ai_message: schema.aiMessage,
    usage_record: schema.usageRecord,
    ai_usage: schema.aiUsage,
    ai_wallet: schema.aiWallet,
    ai_wallet_transaction: schema.aiWalletTransaction,
    organization: schema.organization,
    organization_role: schema.organizationRole,
    organization_role_permission: schema.organizationRolePermission,
    organization_member: schema.organizationMember,
    organization_invitation: schema.organizationInvitation,
    organization_setting: schema.organizationSetting,
    notification: schema.notification,
    product: schema.product,
    client: schema.client,
    order: schema.order,
} as const;
