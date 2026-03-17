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
export type Service = InferSelectModel<typeof schema.service>;
export type ParticipantDataSchema = InferSelectModel<typeof schema.participantDataSchema>;
export type Slot = InferSelectModel<typeof schema.slot>;
export type SlotOccurrence = InferSelectModel<typeof schema.slotOccurrence>;
export type Booking = InferSelectModel<typeof schema.booking>;
export type Checkout = InferSelectModel<typeof schema.checkout>;
export type DateMemo = InferSelectModel<typeof schema.dateMemo>;
export type BookingSmsReminder = InferSelectModel<typeof schema.bookingSmsReminder>;
export type ServicePriceMatrix = InferSelectModel<typeof schema.servicePriceMatrix>;
export type ServicePriceMatrixInterval = InferSelectModel<typeof schema.servicePriceMatrixInterval>;
export type ServicePriceExtra = InferSelectModel<typeof schema.servicePriceExtra>;
export type ServiceParticipantDataSchema = InferSelectModel<typeof schema.serviceParticipantDataSchema>;
export type ServicePriceMatrixCell = InferSelectModel<typeof schema.servicePriceMatrixCell>;

// Enum Types
export type AiThreadStatusEnum = typeof schema.aiThreadStatus.enumValues[number];
export type BookingStateEnum = typeof schema.bookingState.enumValues[number];
export type ContentStateEnum = typeof schema.contentState.enumValues[number];
export type FrequencyTypeEnum = typeof schema.frequencyType.enumValues[number];
export type MatrixAxisEnum = typeof schema.matrixAxis.enumValues[number];
export type NotificationTypeEnum = typeof schema.notificationType.enumValues[number];
export type OrgPermissionEnum = typeof schema.orgPermission.enumValues[number];
export type SlotStateEnum = typeof schema.slotState.enumValues[number];

// Table Schema Map for Dynamic Access
export const tableSchemaMap = {
    'user': schema.user,
    'user_setting': schema.userSetting,
    'subscription': schema.subscription,
    'ai_thread': schema.aiThread,
    'ai_message': schema.aiMessage,
    'usage_record': schema.usageRecord,
    'ai_usage': schema.aiUsage,
    'ai_wallet': schema.aiWallet,
    'ai_wallet_transaction': schema.aiWalletTransaction,
    'organization': schema.organization,
    'organization_role': schema.organizationRole,
    'organization_role_permission': schema.organizationRolePermission,
    'organization_member': schema.organizationMember,
    'organization_invitation': schema.organizationInvitation,
    'organization_setting': schema.organizationSetting,
    'notification': schema.notification,
    'service': schema.service,
    'participant_data_schema': schema.participantDataSchema,
    'slot': schema.slot,
    'slot_occurrence': schema.slotOccurrence,
    'booking': schema.booking,
    'checkout': schema.checkout,
    'date_memo': schema.dateMemo,
    'booking_sms_reminder': schema.bookingSmsReminder,
    'service_price_matrix': schema.servicePriceMatrix,
    'service_price_matrix_interval': schema.servicePriceMatrixInterval,
    'service_price_extra': schema.servicePriceExtra,
    'service_participant_data_schema': schema.serviceParticipantDataSchema,
    'service_price_matrix_cell': schema.servicePriceMatrixCell
} as const;
