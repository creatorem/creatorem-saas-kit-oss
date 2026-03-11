import { relations } from "drizzle-orm/relations";
import { usersInAuth, user, userSetting, subscription, aiThread, aiMessage, usageRecord, aiUsage, aiWallet, aiWalletTransaction, organization, organizationRole, organizationRolePermission, organizationMember, organizationInvitation, organizationSetting, notification, service, participantDataSchema, slot, slotOccurrence, booking, checkout, dateMemo, bookingSmsReminder } from "./schema";

export const userRelations = relations(user, ({one, many}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [user.authUserId],
		references: [usersInAuth.id]
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
	slots: many(slot),
	slotOccurrences: many(slotOccurrence),
	bookings: many(booking),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	users: many(user),
}));

export const userSettingRelations = relations(userSetting, ({one}) => ({
	user: one(user, {
		fields: [userSetting.userId],
		references: [user.id]
	}),
}));

export const subscriptionRelations = relations(subscription, ({one, many}) => ({
	user: one(user, {
		fields: [subscription.userId],
		references: [user.id]
	}),
	usageRecords: many(usageRecord),
}));

export const aiThreadRelations = relations(aiThread, ({one, many}) => ({
	user: one(user, {
		fields: [aiThread.userId],
		references: [user.id]
	}),
	aiMessages: many(aiMessage),
}));

export const aiMessageRelations = relations(aiMessage, ({one}) => ({
	user: one(user, {
		fields: [aiMessage.userId],
		references: [user.id]
	}),
	aiThread: one(aiThread, {
		fields: [aiMessage.threadId],
		references: [aiThread.id]
	}),
}));

export const usageRecordRelations = relations(usageRecord, ({one}) => ({
	user: one(user, {
		fields: [usageRecord.userId],
		references: [user.id]
	}),
	subscription: one(subscription, {
		fields: [usageRecord.subscriptionId],
		references: [subscription.id]
	}),
}));

export const aiUsageRelations = relations(aiUsage, ({one}) => ({
	user: one(user, {
		fields: [aiUsage.userId],
		references: [user.id]
	}),
}));

export const aiWalletRelations = relations(aiWallet, ({one, many}) => ({
	user: one(user, {
		fields: [aiWallet.userId],
		references: [user.id]
	}),
	aiWalletTransactions: many(aiWalletTransaction),
}));

export const aiWalletTransactionRelations = relations(aiWalletTransaction, ({one}) => ({
	user: one(user, {
		fields: [aiWalletTransaction.userId],
		references: [user.id]
	}),
	aiWallet: one(aiWallet, {
		fields: [aiWalletTransaction.walletId],
		references: [aiWallet.id]
	}),
}));

export const organizationRoleRelations = relations(organizationRole, ({one, many}) => ({
	organization: one(organization, {
		fields: [organizationRole.organizationId],
		references: [organization.id]
	}),
	organizationRolePermissions: many(organizationRolePermission),
	organizationMembers: many(organizationMember),
	organizationInvitations: many(organizationInvitation),
	dateMemos: many(dateMemo),
}));

export const organizationRelations = relations(organization, ({many}) => ({
	organizationRoles: many(organizationRole),
	organizationRolePermissions: many(organizationRolePermission),
	organizationMembers: many(organizationMember),
	organizationInvitations: many(organizationInvitation),
	organizationSettings: many(organizationSetting),
	notifications: many(notification),
	services: many(service),
	participantDataSchemas: many(participantDataSchema),
	slots: many(slot),
	slotOccurrences: many(slotOccurrence),
	bookings: many(booking),
	checkouts: many(checkout),
	dateMemos: many(dateMemo),
	bookingSmsReminders: many(bookingSmsReminder),
}));

export const organizationRolePermissionRelations = relations(organizationRolePermission, ({one}) => ({
	organizationRole: one(organizationRole, {
		fields: [organizationRolePermission.roleId],
		references: [organizationRole.id]
	}),
	organization: one(organization, {
		fields: [organizationRolePermission.organizationId],
		references: [organization.id]
	}),
}));

export const organizationMemberRelations = relations(organizationMember, ({one}) => ({
	organizationRole: one(organizationRole, {
		fields: [organizationMember.roleId],
		references: [organizationRole.id]
	}),
	user: one(user, {
		fields: [organizationMember.userId],
		references: [user.id]
	}),
	organization: one(organization, {
		fields: [organizationMember.organizationId],
		references: [organization.id]
	}),
}));

export const organizationInvitationRelations = relations(organizationInvitation, ({one}) => ({
	organization: one(organization, {
		fields: [organizationInvitation.organizationId],
		references: [organization.id]
	}),
	organizationRole: one(organizationRole, {
		fields: [organizationInvitation.roleId],
		references: [organizationRole.id]
	}),
	user: one(user, {
		fields: [organizationInvitation.invitedBy],
		references: [user.id]
	}),
}));

export const organizationSettingRelations = relations(organizationSetting, ({one}) => ({
	organization: one(organization, {
		fields: [organizationSetting.organizationId],
		references: [organization.id]
	}),
}));

export const notificationRelations = relations(notification, ({one}) => ({
	user: one(user, {
		fields: [notification.userId],
		references: [user.id]
	}),
	organization: one(organization, {
		fields: [notification.organizationId],
		references: [organization.id]
	}),
}));

export const serviceRelations = relations(service, ({one, many}) => ({
	organization: one(organization, {
		fields: [service.organizationId],
		references: [organization.id]
	}),
	participantDataSchemas: many(participantDataSchema),
	slots: many(slot),
	slotOccurrences: many(slotOccurrence),
	bookings: many(booking),
}));

export const participantDataSchemaRelations = relations(participantDataSchema, ({one, many}) => ({
	organization: one(organization, {
		fields: [participantDataSchema.organizationId],
		references: [organization.id]
	}),
	service: one(service, {
		fields: [participantDataSchema.serviceId],
		references: [service.id]
	}),
	participantDataSchema: one(participantDataSchema, {
		fields: [participantDataSchema.displayAccordingToId],
		references: [participantDataSchema.id],
		relationName: "participantDataSchema_displayAccordingToId_participantDataSchema_id"
	}),
	participantDataSchemas: many(participantDataSchema, {
		relationName: "participantDataSchema_displayAccordingToId_participantDataSchema_id"
	}),
}));

export const slotRelations = relations(slot, ({one, many}) => ({
	organization: one(organization, {
		fields: [slot.organizationId],
		references: [organization.id]
	}),
	service: one(service, {
		fields: [slot.serviceId],
		references: [service.id]
	}),
	user: one(user, {
		fields: [slot.companyMemberId],
		references: [user.id]
	}),
	slotOccurrences: many(slotOccurrence),
	bookings: many(booking),
}));

export const slotOccurrenceRelations = relations(slotOccurrence, ({one, many}) => ({
	organization: one(organization, {
		fields: [slotOccurrence.organizationId],
		references: [organization.id]
	}),
	slot: one(slot, {
		fields: [slotOccurrence.slotId],
		references: [slot.id]
	}),
	service: one(service, {
		fields: [slotOccurrence.serviceId],
		references: [service.id]
	}),
	user: one(user, {
		fields: [slotOccurrence.companyMemberId],
		references: [user.id]
	}),
	bookings: many(booking),
}));

export const bookingRelations = relations(booking, ({one, many}) => ({
	organization: one(organization, {
		fields: [booking.organizationId],
		references: [organization.id]
	}),
	slot: one(slot, {
		fields: [booking.slotId],
		references: [slot.id]
	}),
	slotOccurrence: one(slotOccurrence, {
		fields: [booking.slotOccurrenceId],
		references: [slotOccurrence.id]
	}),
	service: one(service, {
		fields: [booking.serviceId],
		references: [service.id]
	}),
	user: one(user, {
		fields: [booking.companyMemberId],
		references: [user.id]
	}),
	bookingSmsReminders: many(bookingSmsReminder),
}));

export const checkoutRelations = relations(checkout, ({one}) => ({
	organization: one(organization, {
		fields: [checkout.organizationId],
		references: [organization.id]
	}),
}));

export const dateMemoRelations = relations(dateMemo, ({one}) => ({
	organization: one(organization, {
		fields: [dateMemo.organizationId],
		references: [organization.id]
	}),
	organizationRole: one(organizationRole, {
		fields: [dateMemo.organizationRoleId],
		references: [organizationRole.id]
	}),
}));

export const bookingSmsReminderRelations = relations(bookingSmsReminder, ({one}) => ({
	booking: one(booking, {
		fields: [bookingSmsReminder.bookingId],
		references: [booking.id]
	}),
	organization: one(organization, {
		fields: [bookingSmsReminder.organizationId],
		references: [organization.id]
	}),
}));