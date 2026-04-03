import { relations } from "drizzle-orm/relations";
import { usersInAuth, user, userSetting, subscription, aiThread, aiMessage, usageRecord, aiUsage, aiWallet, aiWalletTransaction, organization, organizationRole, organizationRolePermission, organizationMember, organizationInvitation, organizationSetting, notification, participantDataSchema, slot, service, slotOccurrence, checkout, checkoutPageView, dateMemo, booking, bookingSmsReminder, servicePriceMatrix, servicePriceMatrixInterval, planobyStripeEventLog, organizationTax, invoice, creditNote, bookingClientAccessChallenge, bookingClientAccessSession, servicePriceExtra, bookingCommunicationThread, bookingCommunicationMessage, bookingCommunicationStatusEvent, organizationDiscountCode, organizationDiscountCodeRedemption, serviceParticipantDataSchema, serviceTaxAssignment, invoiceCounter, organizationDiscountCodeService, servicePriceMatrixCell } from "./schema";

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
	dateMemos: many(dateMemo),
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
	aiThread: one(aiThread, {
		fields: [aiMessage.threadId],
		references: [aiThread.id]
	}),
	user: one(user, {
		fields: [aiMessage.userId],
		references: [user.id]
	}),
}));

export const usageRecordRelations = relations(usageRecord, ({one}) => ({
	subscription: one(subscription, {
		fields: [usageRecord.subscriptionId],
		references: [subscription.id]
	}),
	user: one(user, {
		fields: [usageRecord.userId],
		references: [user.id]
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
	participantDataSchemas: many(participantDataSchema),
	slots: many(slot),
	slotOccurrences: many(slotOccurrence),
	checkouts: many(checkout),
	checkoutPageViews: many(checkoutPageView),
	dateMemos: many(dateMemo),
	bookingSmsReminders: many(bookingSmsReminder),
	servicePriceMatrices: many(servicePriceMatrix),
	servicePriceMatrixIntervals: many(servicePriceMatrixInterval),
	planobyStripeEventLogs: many(planobyStripeEventLog),
	services: many(service),
	bookings: many(booking),
	organizationTaxes: many(organizationTax),
	invoices: many(invoice),
	creditNotes: many(creditNote),
	bookingClientAccessChallenges: many(bookingClientAccessChallenge),
	bookingClientAccessSessions: many(bookingClientAccessSession),
	servicePriceExtras: many(servicePriceExtra),
	bookingCommunicationThreads: many(bookingCommunicationThread),
	bookingCommunicationMessages: many(bookingCommunicationMessage),
	bookingCommunicationStatusEvents: many(bookingCommunicationStatusEvent),
	organizationDiscountCodes: many(organizationDiscountCode),
	organizationDiscountCodeRedemptions: many(organizationDiscountCodeRedemption),
	serviceParticipantDataSchemas: many(serviceParticipantDataSchema),
	serviceTaxAssignments: many(serviceTaxAssignment),
	invoiceCounters: many(invoiceCounter),
	organizationDiscountCodeServices: many(organizationDiscountCodeService),
	servicePriceMatrixCells: many(servicePriceMatrixCell),
}));

export const organizationRolePermissionRelations = relations(organizationRolePermission, ({one}) => ({
	organization: one(organization, {
		fields: [organizationRolePermission.organizationId],
		references: [organization.id]
	}),
	organizationRole: one(organizationRole, {
		fields: [organizationRolePermission.roleId],
		references: [organizationRole.id]
	}),
}));

export const organizationMemberRelations = relations(organizationMember, ({one}) => ({
	organization: one(organization, {
		fields: [organizationMember.organizationId],
		references: [organization.id]
	}),
	organizationRole: one(organizationRole, {
		fields: [organizationMember.roleId],
		references: [organizationRole.id]
	}),
	user: one(user, {
		fields: [organizationMember.userId],
		references: [user.id]
	}),
}));

export const organizationInvitationRelations = relations(organizationInvitation, ({one}) => ({
	user: one(user, {
		fields: [organizationInvitation.invitedBy],
		references: [user.id]
	}),
	organization: one(organization, {
		fields: [organizationInvitation.organizationId],
		references: [organization.id]
	}),
	organizationRole: one(organizationRole, {
		fields: [organizationInvitation.roleId],
		references: [organizationRole.id]
	}),
}));

export const organizationSettingRelations = relations(organizationSetting, ({one}) => ({
	organization: one(organization, {
		fields: [organizationSetting.organizationId],
		references: [organization.id]
	}),
}));

export const notificationRelations = relations(notification, ({one}) => ({
	organization: one(organization, {
		fields: [notification.organizationId],
		references: [organization.id]
	}),
	user: one(user, {
		fields: [notification.userId],
		references: [user.id]
	}),
}));

export const participantDataSchemaRelations = relations(participantDataSchema, ({one, many}) => ({
	participantDataSchema: one(participantDataSchema, {
		fields: [participantDataSchema.displayAccordingToId],
		references: [participantDataSchema.id],
		relationName: "participantDataSchema_displayAccordingToId_participantDataSchema_id"
	}),
	participantDataSchemas: many(participantDataSchema, {
		relationName: "participantDataSchema_displayAccordingToId_participantDataSchema_id"
	}),
	organization: one(organization, {
		fields: [participantDataSchema.organizationId],
		references: [organization.id]
	}),
	servicePriceMatrices_colSchemaId: many(servicePriceMatrix, {
		relationName: "servicePriceMatrix_colSchemaId_participantDataSchema_id"
	}),
	servicePriceMatrices_rowSchemaId: many(servicePriceMatrix, {
		relationName: "servicePriceMatrix_rowSchemaId_participantDataSchema_id"
	}),
	serviceParticipantDataSchemas: many(serviceParticipantDataSchema),
}));

export const slotRelations = relations(slot, ({one, many}) => ({
	user: one(user, {
		fields: [slot.companyMemberId],
		references: [user.id]
	}),
	organization: one(organization, {
		fields: [slot.organizationId],
		references: [organization.id]
	}),
	service: one(service, {
		fields: [slot.serviceId],
		references: [service.id]
	}),
	slotOccurrences: many(slotOccurrence),
	bookings: many(booking),
}));

export const serviceRelations = relations(service, ({one, many}) => ({
	slots: many(slot),
	slotOccurrences: many(slotOccurrence),
	servicePriceMatrices: many(servicePriceMatrix),
	organization: one(organization, {
		fields: [service.organizationId],
		references: [organization.id]
	}),
	bookings: many(booking),
	servicePriceExtras: many(servicePriceExtra),
	serviceParticipantDataSchemas: many(serviceParticipantDataSchema),
	serviceTaxAssignments: many(serviceTaxAssignment),
	organizationDiscountCodeServices: many(organizationDiscountCodeService),
}));

export const slotOccurrenceRelations = relations(slotOccurrence, ({one, many}) => ({
	user: one(user, {
		fields: [slotOccurrence.companyMemberId],
		references: [user.id]
	}),
	organization: one(organization, {
		fields: [slotOccurrence.organizationId],
		references: [organization.id]
	}),
	service: one(service, {
		fields: [slotOccurrence.serviceId],
		references: [service.id]
	}),
	slot: one(slot, {
		fields: [slotOccurrence.slotId],
		references: [slot.id]
	}),
	bookings: many(booking),
}));

export const checkoutRelations = relations(checkout, ({one, many}) => ({
	organization: one(organization, {
		fields: [checkout.organizationId],
		references: [organization.id]
	}),
	checkoutPageViews: many(checkoutPageView),
}));

export const checkoutPageViewRelations = relations(checkoutPageView, ({one}) => ({
	checkout: one(checkout, {
		fields: [checkoutPageView.checkoutId],
		references: [checkout.id]
	}),
	organization: one(organization, {
		fields: [checkoutPageView.organizationId],
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
	user: one(user, {
		fields: [dateMemo.userId],
		references: [user.id]
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

export const bookingRelations = relations(booking, ({one, many}) => ({
	bookingSmsReminders: many(bookingSmsReminder),
	planobyStripeEventLogs: many(planobyStripeEventLog),
	user: one(user, {
		fields: [booking.companyMemberId],
		references: [user.id]
	}),
	organization: one(organization, {
		fields: [booking.organizationId],
		references: [organization.id]
	}),
	service: one(service, {
		fields: [booking.serviceId],
		references: [service.id]
	}),
	slot: one(slot, {
		fields: [booking.slotId],
		references: [slot.id]
	}),
	slotOccurrence: one(slotOccurrence, {
		fields: [booking.slotOccurrenceId],
		references: [slotOccurrence.id]
	}),
	invoices: many(invoice),
	creditNotes: many(creditNote),
	bookingCommunicationThreads: many(bookingCommunicationThread),
	bookingCommunicationMessages: many(bookingCommunicationMessage),
	bookingCommunicationStatusEvents: many(bookingCommunicationStatusEvent),
	organizationDiscountCodeRedemptions: many(organizationDiscountCodeRedemption),
}));

export const servicePriceMatrixRelations = relations(servicePriceMatrix, ({one, many}) => ({
	participantDataSchema_colSchemaId: one(participantDataSchema, {
		fields: [servicePriceMatrix.colSchemaId],
		references: [participantDataSchema.id],
		relationName: "servicePriceMatrix_colSchemaId_participantDataSchema_id"
	}),
	organization: one(organization, {
		fields: [servicePriceMatrix.organizationId],
		references: [organization.id]
	}),
	participantDataSchema_rowSchemaId: one(participantDataSchema, {
		fields: [servicePriceMatrix.rowSchemaId],
		references: [participantDataSchema.id],
		relationName: "servicePriceMatrix_rowSchemaId_participantDataSchema_id"
	}),
	service: one(service, {
		fields: [servicePriceMatrix.serviceId],
		references: [service.id]
	}),
	servicePriceMatrixIntervals: many(servicePriceMatrixInterval),
	servicePriceMatrixCells: many(servicePriceMatrixCell),
}));

export const servicePriceMatrixIntervalRelations = relations(servicePriceMatrixInterval, ({one}) => ({
	servicePriceMatrix: one(servicePriceMatrix, {
		fields: [servicePriceMatrixInterval.matrixId],
		references: [servicePriceMatrix.id]
	}),
	organization: one(organization, {
		fields: [servicePriceMatrixInterval.organizationId],
		references: [organization.id]
	}),
}));

export const planobyStripeEventLogRelations = relations(planobyStripeEventLog, ({one}) => ({
	booking: one(booking, {
		fields: [planobyStripeEventLog.bookingId],
		references: [booking.id]
	}),
	organization: one(organization, {
		fields: [planobyStripeEventLog.organizationId],
		references: [organization.id]
	}),
}));

export const organizationTaxRelations = relations(organizationTax, ({one, many}) => ({
	organization: one(organization, {
		fields: [organizationTax.organizationId],
		references: [organization.id]
	}),
	serviceTaxAssignments: many(serviceTaxAssignment),
}));

export const invoiceRelations = relations(invoice, ({one, many}) => ({
	booking: one(booking, {
		fields: [invoice.bookingId],
		references: [booking.id]
	}),
	organization: one(organization, {
		fields: [invoice.organizationId],
		references: [organization.id]
	}),
	creditNotes: many(creditNote),
}));

export const creditNoteRelations = relations(creditNote, ({one}) => ({
	booking: one(booking, {
		fields: [creditNote.bookingId],
		references: [booking.id]
	}),
	invoice: one(invoice, {
		fields: [creditNote.invoiceId],
		references: [invoice.id]
	}),
	organization: one(organization, {
		fields: [creditNote.organizationId],
		references: [organization.id]
	}),
}));

export const bookingClientAccessChallengeRelations = relations(bookingClientAccessChallenge, ({one}) => ({
	organization: one(organization, {
		fields: [bookingClientAccessChallenge.organizationId],
		references: [organization.id]
	}),
}));

export const bookingClientAccessSessionRelations = relations(bookingClientAccessSession, ({one}) => ({
	organization: one(organization, {
		fields: [bookingClientAccessSession.organizationId],
		references: [organization.id]
	}),
}));

export const servicePriceExtraRelations = relations(servicePriceExtra, ({one}) => ({
	organization: one(organization, {
		fields: [servicePriceExtra.organizationId],
		references: [organization.id]
	}),
	service: one(service, {
		fields: [servicePriceExtra.serviceId],
		references: [service.id]
	}),
}));

export const bookingCommunicationThreadRelations = relations(bookingCommunicationThread, ({one, many}) => ({
	booking: one(booking, {
		fields: [bookingCommunicationThread.bookingId],
		references: [booking.id]
	}),
	organization: one(organization, {
		fields: [bookingCommunicationThread.organizationId],
		references: [organization.id]
	}),
	bookingCommunicationMessages: many(bookingCommunicationMessage),
}));

export const bookingCommunicationMessageRelations = relations(bookingCommunicationMessage, ({one, many}) => ({
	booking: one(booking, {
		fields: [bookingCommunicationMessage.bookingId],
		references: [booking.id]
	}),
	organization: one(organization, {
		fields: [bookingCommunicationMessage.organizationId],
		references: [organization.id]
	}),
	bookingCommunicationThread: one(bookingCommunicationThread, {
		fields: [bookingCommunicationMessage.threadId],
		references: [bookingCommunicationThread.id]
	}),
	bookingCommunicationStatusEvents: many(bookingCommunicationStatusEvent),
}));

export const bookingCommunicationStatusEventRelations = relations(bookingCommunicationStatusEvent, ({one}) => ({
	booking: one(booking, {
		fields: [bookingCommunicationStatusEvent.bookingId],
		references: [booking.id]
	}),
	bookingCommunicationMessage: one(bookingCommunicationMessage, {
		fields: [bookingCommunicationStatusEvent.messageId],
		references: [bookingCommunicationMessage.id]
	}),
	organization: one(organization, {
		fields: [bookingCommunicationStatusEvent.organizationId],
		references: [organization.id]
	}),
}));

export const organizationDiscountCodeRelations = relations(organizationDiscountCode, ({one, many}) => ({
	organization: one(organization, {
		fields: [organizationDiscountCode.organizationId],
		references: [organization.id]
	}),
	organizationDiscountCodeRedemptions: many(organizationDiscountCodeRedemption),
	organizationDiscountCodeServices: many(organizationDiscountCodeService),
}));

export const organizationDiscountCodeRedemptionRelations = relations(organizationDiscountCodeRedemption, ({one}) => ({
	booking: one(booking, {
		fields: [organizationDiscountCodeRedemption.bookingId],
		references: [booking.id]
	}),
	organizationDiscountCode: one(organizationDiscountCode, {
		fields: [organizationDiscountCodeRedemption.discountCodeId],
		references: [organizationDiscountCode.id]
	}),
	organization: one(organization, {
		fields: [organizationDiscountCodeRedemption.organizationId],
		references: [organization.id]
	}),
}));

export const serviceParticipantDataSchemaRelations = relations(serviceParticipantDataSchema, ({one}) => ({
	organization: one(organization, {
		fields: [serviceParticipantDataSchema.organizationId],
		references: [organization.id]
	}),
	participantDataSchema: one(participantDataSchema, {
		fields: [serviceParticipantDataSchema.participantDataSchemaId],
		references: [participantDataSchema.id]
	}),
	service: one(service, {
		fields: [serviceParticipantDataSchema.serviceId],
		references: [service.id]
	}),
}));

export const serviceTaxAssignmentRelations = relations(serviceTaxAssignment, ({one}) => ({
	organization: one(organization, {
		fields: [serviceTaxAssignment.organizationId],
		references: [organization.id]
	}),
	service: one(service, {
		fields: [serviceTaxAssignment.serviceId],
		references: [service.id]
	}),
	organizationTax: one(organizationTax, {
		fields: [serviceTaxAssignment.taxId],
		references: [organizationTax.id]
	}),
}));

export const invoiceCounterRelations = relations(invoiceCounter, ({one}) => ({
	organization: one(organization, {
		fields: [invoiceCounter.organizationId],
		references: [organization.id]
	}),
}));

export const organizationDiscountCodeServiceRelations = relations(organizationDiscountCodeService, ({one}) => ({
	organizationDiscountCode: one(organizationDiscountCode, {
		fields: [organizationDiscountCodeService.discountCodeId],
		references: [organizationDiscountCode.id]
	}),
	organization: one(organization, {
		fields: [organizationDiscountCodeService.organizationId],
		references: [organization.id]
	}),
	service: one(service, {
		fields: [organizationDiscountCodeService.serviceId],
		references: [service.id]
	}),
}));

export const servicePriceMatrixCellRelations = relations(servicePriceMatrixCell, ({one}) => ({
	servicePriceMatrix: one(servicePriceMatrix, {
		fields: [servicePriceMatrixCell.matrixId],
		references: [servicePriceMatrix.id]
	}),
	organization: one(organization, {
		fields: [servicePriceMatrixCell.organizationId],
		references: [organization.id]
	}),
}));