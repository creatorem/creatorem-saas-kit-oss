import React from 'react';
import {
    AuthProviderZone,
    DangerZoneComponent,
    MultiFactorAuthList,
    SessionZoneComponent,
    UserSettingMedia,
} from '@kit/auth/native/user';
import { LanguageSelectorBase } from '@kit/i18n/native/ui/language-selector';
import { parseUISettingConfig } from '@kit/settings/ui-config';
import { Icon } from '@kit/native-ui/icon';
import { Divider } from '@kit/native-ui/divider';
import type { settingsSchemas } from '@planoby/shared/config/settings.schema.config';
import type { AppRouter } from '@planoby/shared/types/router';
import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import { Text } from '@kit/native-ui/text';
import { View } from 'react-native';
import { authConfig } from './auth.config';
import { OrganizationSettingMedia } from '@kit/organization/native/ui';
import { TimezoneSettingInput } from '~/components/settings/timezone-setting-input';
import { ReminderDelaySettingInput } from '~/components/settings/reminder-delay-setting-input';
import { EmailProviderSettingInput } from '~/components/settings/email-provider-setting-input';
import { SmsProviderSettingInput } from '~/components/settings/sms-provider-setting-input';
import { HourTimeInput } from '~/components/settings/hour-time-input';
import { StripeConnectSetting } from '~/components/settings/stripe-connect-setting';
import { EmailThemeCardsSettingInput } from '~/components/settings/email-theme-cards-setting-input';
import { EmailSettingsLivePreview } from '~/components/settings/email-settings-live-preview';
import { InvoiceSettingsLivePreview } from '~/components/settings/invoice-settings-live-preview';
import { SmsTemplateSettingInput } from '~/components/settings/sms-template-setting-input';
import { SmsSettingsLivePreview } from '~/components/settings/sms-settings-live-preview';
import { OrganizationTaxesSetting } from '~/components/settings/organization-taxes-setting';
import { OrganizationDiscountsSetting } from '~/components/settings/organization-discounts-setting';
import { GoogleCalendarSyncSetting } from '~/components/settings/google-calendar-sync-setting';
import { PdpConnectionSetting } from '~/components/settings/pdp-connection-setting';
import { FiscalComplianceCenterSetting } from '~/components/settings/fiscal-compliance-center-setting';

const Muted = ({ children }: { children: React.ReactNode }) => (
    <Text className="text-muted-foreground text-sm">{children}</Text>
);

export const EXTRA_INPUTS = {
    user_media: UserSettingMedia,
    organization_media: OrganizationSettingMedia,
    timezone_setting: TimezoneSettingInput,
    reminder_delay_setting: ReminderDelaySettingInput,
    email_provider_setting: EmailProviderSettingInput,
    sms_provider_setting: SmsProviderSettingInput,
    hour_time: HourTimeInput,
    email_theme_cards: EmailThemeCardsSettingInput,
    sms_template_textarea: SmsTemplateSettingInput,
};

export const getSettingsUI = (t: TFunction<'settings'>, orgT: TFunction<'p_org-settings'>, clientTrpc: TrpcClientWithQuery<AppRouter>) =>
    parseUISettingConfig<typeof settingsSchemas.schema, typeof EXTRA_INPUTS>({
        ui: [
            {
                group: 'index',
                label: t('groups.aboutYou'),
                settingsPages: [
                    {
                        // match : "/" endpoint
                        slug: 'index',
                        icon: 'User',
                        title: t('profile.title'),
                        description: t('profile.description'),
                        settings: [
                            {
                                type: 'form',
                                id: 'profile-form',
                                header: (
                                    <>
                                        <Text className="text-2xl font-bold">{t('profile.form.title')}</Text>
                                        <Muted>{t('profile.form.description')}</Muted>
                                    </>
                                ),
                                submitButton: {
                                    text: t('profile.form.submit'),
                                },
                                settings: [
                                    {
                                        type: 'wrapper',
                                        className:
                                            'p-0 sm:px-0 flex flex-col gap-4 md:flex-row-reverse md:justify-end md:gap-10',
                                        settings: [
                                            {
                                                type: 'user_media',
                                                slug: 'user_profile_url',
                                                label: t('profile.form.profileImage'),
                                                triggerClassName: 'h-48 w-48 rounded-full',
                                                imageClassName: 'w-full h-full object-cover',
                                                placeholder: (<View className="border-border flex size-full items-center justify-center rounded-full border border-dashed"><Icon name="Image" size={24} /></View>),
                                            },
                                            {
                                                type: 'wrapper',
                                                className: 'p-0 flex-1 max-w-lg sm:px-0',
                                                settings: [
                                                    {
                                                        type: 'text',
                                                        slug: 'user_name',
                                                        label: t('profile.form.name.label'),
                                                        description: t('profile.form.name.description'),
                                                    },
                                                    {
                                                        type: 'textarea',
                                                        slug: 'user_bio',
                                                        label: t('profile.form.bio.label'),
                                                        description: t('profile.form.bio.description'),
                                                    },
                                                    {
                                                        type: 'phone',
                                                        slug: 'user_phone',
                                                        label: t('profile.form.phone.label'),
                                                        description: t('profile.form.phone.description'),
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'ui',
                                render: <Divider />,
                            },
                            {
                                type: 'form',
                                id: 'email-form',
                                header: (
                                    <>
                                        <Text className="text-2xl font-bold">{t('profile.email.title')}</Text>
                                        <Muted>{t('profile.email.description')}</Muted>
                                    </>
                                ),
                                submitButton: {
                                    text: t('profile.email.submit'),
                                },
                                settings: [
                                    {
                                        type: 'text',
                                        slug: 'user_email',
                                        label: t('profile.email.label'),
                                        description: t('profile.email.fieldDescription'),
                                    },
                                    {
                                        slug: null,
                                        name: 'confirm_email',
                                        type: 'text',
                                        label: t('profile.email.confirm.label'),
                                        description: t('profile.email.confirm.description'),
                                        placeholder: t('profile.email.confirm.placeholder'),
                                        schema: z.string().email(t('profile.email.confirm.error.invalid')),
                                        clearOnSubmit: true,
                                        onSubmit: async (values: Record<string, any>) => {
                                            if (values.user_email && values.confirm_email) {
                                                if (values.user_email !== values.confirm_email) {
                                                    throw new Error(t('profile.email.confirm.error.mismatch'));
                                                }
                                            }
                                        },
                                    },
                                ],
                            },
                            {
                                type: 'ui',
                                render: <Divider />,
                            },
                            {
                                type: 'form',
                                id: 'appearance-form',
                                header: (
                                    <>
                                        <Text className="text-2xl font-bold">{t('profile.appearance.title')}</Text>
                                        <Muted>{t('profile.appearance.description')}</Muted>
                                    </>
                                ),
                                submitButton: {
                                    text: t('profile.appearance.submit'),
                                },
                                settings: [
                                    {
                                        type: 'theme',
                                        slug: 'theme',
                                        label: t('profile.appearance.theme.label'),
                                        description: t('profile.appearance.theme.description'),
                                        descriptionPosition: 'above',
                                    },
                                    {
                                        type: 'ui',
                                        render: (
                                            <View className="w-full max-w-lg">
                                                <LanguageSelectorBase />
                                            </View>
                                        ),
                                    },
                                ],
                            },
                            {
                                type: 'ui',
                                render: <Divider />,
                            },
                            {
                                type: 'wrapper',
                                settings: [
                                    {
                                        type: 'ui',
                                        render: (
                                            <DangerZoneComponent
                                                className="max-w-4xl"
                                                clientTrpc={clientTrpc}
                                            />
                                        ),
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        slug: 'security',
                        title: t('security.title'),
                        icon: 'Lock',
                        description: t('security.description'),
                        settings: [
                            {
                                type: 'wrapper',
                                settings: [
                                    {
                                        type: 'ui',
                                        render: (
                                            <View className="max-w-4xl space-y-4">
                                                <View className="flex flex-col gap-2">
                                                    <Text className="text-2xl font-bold">
                                                        {t('security.authentication.title')}
                                                    </Text>
                                                    <Muted>{t('security.authentication.description')}</Muted>
                                                </View>
                                                <AuthProviderZone authConfig={authConfig} />
                                            </View>
                                        ),
                                    },
                                ],
                            },
                            {
                                type: 'ui',
                                render: <Divider />,
                            },
                            {
                                type: 'wrapper',
                                settings: [
                                    {
                                        type: 'ui',
                                        render: (
                                            <View className="max-w-4xl space-y-4">
                                                <View className="flex flex-col gap-2">
                                                    <Text className="text-2xl font-bold">
                                                        {t('security.session.title')}
                                                    </Text>
                                                    <Muted>{t('security.session.description')}</Muted>
                                                </View>
                                                <SessionZoneComponent
                                                    clientTrpc={clientTrpc}
                                                />
                                            </View>
                                        ),
                                    },
                                ],
                            },
                            {
                                type: 'ui',
                                render: <Divider />,
                            },
                            {
                                type: 'wrapper',
                                settings: [
                                    {
                                        type: 'ui',
                                        render: (
                                            <View className="max-w-4xl space-y-4">
                                                <View className="flex flex-col gap-2">
                                                    <Text className="text-2xl font-bold">{t('security.mfa.title')}</Text>
                                                    <Muted>{t('security.mfa.description')}</Muted>
                                                </View>
                                                <Text className="text-muted-foreground text-sm">{t('security.mfa.unavailable')}</Text>
                                            </View>
                                        ),
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                group: 'payments',
                label: t('groups.payments'),
                settingsPages: [
                    {
                        slug: 'checkout',
                        title: t('company.checkout.title'),
                        icon: 'ShoppingCart',
                        description: t('company.checkout.description'),
                        settings: [
                            {
                                type: 'form',
                                id: 'company-checkout-form',
                                header: (
                                    <>
                                        <Text className="text-2xl font-bold">{t('company.checkout.title')}</Text>
                                        <Muted>{t('company.checkout.description')}</Muted>
                                    </>
                                ),
                                submitButton: {
                                    text: t('company.checkout.submit'),
                                },
                                settings: [
                                    {
                                        type: 'boolean',
                                        slug: 'enable_customer_note',
                                        label: t('company.checkout.enableCustomerNote.label'),
                                        description: t('company.checkout.enableCustomerNote.description'),
                                    },
                                    {
                                        type: 'select',
                                        slug: 'checkout_address_mode',
                                        label: t('company.checkout.addressMode.label'),
                                        description: t('company.checkout.addressMode.description'),
                                        options: [
                                            {
                                                label: t('company.checkout.addressMode.options.none'),
                                                value: 'none',
                                            },
                                            {
                                                label: t('company.checkout.addressMode.options.optional'),
                                                value: 'optional',
                                            },
                                            {
                                                label: t('company.checkout.addressMode.options.required'),
                                                value: 'required',
                                            },
                                        ],
                                    },
                                    {
                                        type: 'select',
                                        slug: 'checkout_business_fields_mode',
                                        label: t('company.checkout.businessFieldsMode.label'),
                                        description: t('company.checkout.businessFieldsMode.description'),
                                        options: [
                                            {
                                                label: t('company.checkout.businessFieldsMode.options.none'),
                                                value: 'none',
                                            },
                                            {
                                                label: t('company.checkout.businessFieldsMode.options.optional'),
                                                value: 'optional',
                                            },
                                            {
                                                label: t('company.checkout.businessFieldsMode.options.required'),
                                                value: 'required',
                                            },
                                        ],
                                    },
                                    {
                                        type: 'boolean',
                                        slug: 'enable_slot_request',
                                        label: t('company.checkout.enableSlotRequest.label'),
                                        description: t('company.checkout.enableSlotRequest.description'),
                                    },
                                    {
                                        type: 'number',
                                        slug: 'slot_request_max_participant',
                                        label: t('company.checkout.slotRequestMaxParticipant.label'),
                                        description: t('company.checkout.slotRequestMaxParticipant.description'),
                                    },
                                    {
                                        type: 'number',
                                        slug: 'optional_participant_data_threshold',
                                        label: t('company.checkout.optionalParticipantDataThreshold.label'),
                                        description: t('company.checkout.optionalParticipantDataThreshold.description'),
                                    },
                                    {
                                        type: 'select',
                                        slug: 'participant_display_format',
                                        label: t('company.checkout.participantDisplayFormat.label'),
                                        description: t('company.checkout.participantDisplayFormat.description'),
                                        options: [
                                            {
                                                label: t('company.checkout.participantDisplayFormat.options.fraction'),
                                                value: 'fraction',
                                            },
                                            {
                                                label: t('company.checkout.participantDisplayFormat.options.remaining'),
                                                value: 'remaining',
                                            },
                                        ],
                                    },
                                    {
                                        type: 'boolean',
                                        slug: 'checkout_show_service_gallery',
                                        label: t('company.checkout.showServiceGallery.label'),
                                        description: t('company.checkout.showServiceGallery.description'),
                                    },
                                    {
                                        type: 'textarea',
                                        slug: 'checkout_embed_allowed_domains',
                                        label: t('company.checkout.embedAllowedDomains.label'),
                                        description: t('company.checkout.embedAllowedDomains.description'),
                                        placeholder: t('company.checkout.embedAllowedDomains.placeholder'),
                                    },
                                    {
                                        type: 'reminder_delay_setting',
                                        slug: 'time_before_booking',
                                        label: t('company.checkout.timeBeforeBooking.label'),
                                        description: t('company.checkout.timeBeforeBooking.description'),
                                        descriptionPosition: 'above',
                                        defaultDays: 1,
                                        defaultHours: 0,
                                    },
                                    {
                                        type: 'boolean',
                                        slug: 'ceil_to_day_time_before_duration',
                                        label: t('company.checkout.ceilTimeBeforeToday.label'),
                                        description: t('company.checkout.ceilTimeBeforeToday.description'),
                                    },
                                ],
                            },
                            {
                                type: 'ui',
                                render: <Divider />,
                            },
                            {
                                type: 'form',
                                id: 'company-checkout-confirmation-form',
                                header: (
                                    <>
                                        <Text className="text-2xl font-bold">{t('company.checkout.confirmation.title')}</Text>
                                        {/* <Muted>{t('company.checkout.description')}</Muted> */}
                                    </>
                                ),
                                submitButton: {
                                    text: t('company.checkout.submit'),
                                },
                                settings: [
                                    {
                                        type: 'radio',
                                        slug: 'payment_mode',
                                        'descriptionPosition': 'above',
                                        label: t('company.checkout.confirmation.method.label'),
                                        description: t('company.checkout.confirmation.method.description'),
                                        options: [
                                            {
                                                label: t(
                                                    'company.checkout.confirmation.method.options.noConfirmation.label',
                                                ),
                                                value: 'no_payment_required',
                                            },
                                            {
                                                label: (
                                                    <View className="flex flex-col gap-1">
                                                        <Text>
                                                            {t(
                                                                'company.checkout.confirmation.method.options.creditCard.label',
                                                            )}
                                                        </Text>
                                                        <Text className="text-muted-foreground text-xs">
                                                            {t(
                                                                'company.checkout.confirmation.method.options.creditCard.description',
                                                            )}
                                                        </Text>
                                                    </View>
                                                ),
                                                value: 'save_for_future_debit',
                                            },
                                            {
                                                label: (
                                                    <View className="flex flex-col gap-1">
                                                        <Text>{t('company.checkout.confirmation.method.options.chargeNow.label')}</Text>
                                                        <Text className="text-muted-foreground text-xs">
                                                            {t(
                                                                'company.checkout.confirmation.method.options.chargeNow.description',
                                                            )}
                                                        </Text>
                                                    </View>
                                                ),
                                                value: 'charge_at_reservation',
                                            },
                                        ],
                                    },
                                    {
                                        type: 'text',
                                        slug: 'checkout_confirmation_return_url',
                                        label: t('company.checkout.confirmation.returnUrl.label'),
                                        description: t('company.checkout.confirmation.returnUrl.description'),
                                        placeholder: t('company.checkout.confirmation.returnUrl.placeholder'),
                                    },
                                ],
                            },
                            {
                                type: 'ui',
                                render: <Divider />,
                            },
                            {
                                type: 'form',
                                id: 'company-payment-form',
                                header: (
                                    <>
                                        <Text className="text-2xl font-bold">{t('company.payment.title')}</Text>
                                        <Muted>{t('company.payment.description')}</Muted>
                                    </>
                                ),
                                submitButton: {
                                    text: t('company.payment.submit'),
                                },
                                settings: [
                                    {
                                        type: 'select',
                                        slug: 'currency',
                                        label: t('company.payment.currency.label'),
                                        description: t('company.payment.currency.description'),
                                        options: [
                                            { label: 'USD', value: 'usd' },
                                            { label: 'EUR', value: 'eur' },
                                        ],
                                    },
                                    {
                                        type: 'ui',
                                        render: <StripeConnectSetting />,
                                    },
                                ],
                            },
                            {
                                type: 'ui',
                                render: <Divider />,
                            },
                            {
                                type: 'form',
                                id: 'company-fiscal-form',
                                header: (
                                    <>
                                        <Text className="text-2xl font-bold">{t('company.payment.fiscal.title')}</Text>
                                        <Muted>{t('company.payment.fiscal.description')}</Muted>
                                    </>
                                ),
                                submitButton: {
                                    text: t('company.payment.fiscal.submit'),
                                },
                                settings: [
                                    {
                                        type: 'select',
                                        slug: 'fiscal_classification_mode',
                                        label: t('company.payment.fiscal.classificationMode.label'),
                                        description: t('company.payment.fiscal.classificationMode.description'),
                                        options: [
                                            {
                                                label: t('company.payment.fiscal.classificationMode.options.auto'),
                                                value: 'auto',
                                            },
                                            {
                                                label: t('company.payment.fiscal.classificationMode.options.forceB2B'),
                                                value: 'force_b2b',
                                            },
                                            {
                                                label: t('company.payment.fiscal.classificationMode.options.forceB2C'),
                                                value: 'force_b2c',
                                            },
                                        ],
                                    },
                                    {
                                        type: 'text',
                                        slug: 'fiscal_country_code',
                                        label: t('company.payment.fiscal.countryCode.label'),
                                        description: t('company.payment.fiscal.countryCode.description'),
                                    },
                                    {
                                        type: 'select',
                                        slug: 'fiscal_vat_regime',
                                        label: t('company.payment.fiscal.vatRegime.label'),
                                        description: t('company.payment.fiscal.vatRegime.description'),
                                        options: [
                                            {
                                                label: t('company.payment.fiscal.vatRegime.options.encaissement'),
                                                value: 'encaissement',
                                            },
                                            {
                                                label: t('company.payment.fiscal.vatRegime.options.debits'),
                                                value: 'debits',
                                            },
                                        ],
                                    },
                                    {
                                        type: 'select',
                                        slug: 'fiscal_reporting_frequency',
                                        label: t('company.payment.fiscal.reportingFrequency.label'),
                                        description: t('company.payment.fiscal.reportingFrequency.description'),
                                        options: [
                                            {
                                                label: t('company.payment.fiscal.reportingFrequency.options.monthly'),
                                                value: 'monthly',
                                            },
                                            {
                                                label: t('company.payment.fiscal.reportingFrequency.options.quarterly'),
                                                value: 'quarterly',
                                            },
                                        ],
                                    },
                                    {
                                        type: 'boolean',
                                        slug: 'fiscal_non_blocking_mode',
                                        label: t('company.payment.fiscal.nonBlockingMode.label'),
                                        description: t('company.payment.fiscal.nonBlockingMode.description'),
                                    },
                                    {
                                        type: 'select',
                                        slug: 'fiscal_vat_validation_mode',
                                        label: t('company.payment.fiscal.vatValidationMode.label'),
                                        description: t('company.payment.fiscal.vatValidationMode.description'),
                                        options: [
                                            {
                                                label: t('company.payment.fiscal.vatValidationMode.options.strictVies'),
                                                value: 'strict_vies',
                                            },
                                            {
                                                label: t('company.payment.fiscal.vatValidationMode.options.formatOnly'),
                                                value: 'format_only',
                                            },
                                        ],
                                    },
                                    {
                                        type: 'select',
                                        slug: 'pennylane_invoice_publish_mode',
                                        label: t('company.payment.fiscal.pennylanePublishMode.label'),
                                        description: t('company.payment.fiscal.pennylanePublishMode.description'),
                                        options: [
                                            {
                                                label: t('company.payment.fiscal.pennylanePublishMode.options.draft'),
                                                value: 'draft',
                                            },
                                            {
                                                label: t(
                                                    'company.payment.fiscal.pennylanePublishMode.options.finalized',
                                                ),
                                                value: 'finalized',
                                            },
                                        ],
                                    },
                                    {
                                        type: 'ui',
                                        render: <PdpConnectionSetting />,
                                    },
                                    {
                                        type: 'ui',
                                        render: <FiscalComplianceCenterSetting />,
                                    },
                                ],
                            },

                        ],
                    },
                    {
                        slug: 'invoicing',
                        title: t('company.invoicing.pageTitle'),
                        icon: 'FileText',
                        description: t('company.invoicing.pageDescription'),
                        settings: [
                            {
                                type: 'form',
                                id: 'company-invoicing-form',
                                header: (
                                    <>
                                        <Text className="text-2xl font-bold">{t('company.payment.invoicing.title')}</Text>
                                        <Muted>{t('company.payment.invoicing.description')}</Muted>
                                    </>
                                ),
                                submitButton: {
                                    text: t('company.payment.invoicing.submit'),
                                },
                                settings: [
                                    {
                                        type: 'wrapper',
                                        className: 'grid gap-8 xl:grid-cols-[auto_1fr] xl:items-start',
                                        settings: [
                                            {
                                                type: 'wrapper',
                                                className: 'space-y-4',
                                                settings: [
                                                    {
                                                        type: 'text',
                                                        slug: 'invoice_prefix',
                                                        label: t('company.payment.invoicing.fields.invoicePrefix.label'),
                                                        description: t('company.payment.invoicing.fields.invoicePrefix.description'),
                                                    },
                                                    {
                                                        type: 'text',
                                                        slug: 'credit_note_prefix',
                                                        label: t('company.payment.invoicing.fields.creditNotePrefix.label'),
                                                        description: t('company.payment.invoicing.fields.creditNotePrefix.description'),
                                                    },
                                                    {
                                                        type: 'text',
                                                        slug: 'invoice_legal_name',
                                                        label: t('company.payment.invoicing.fields.legalName.label'),
                                                        description: t('company.payment.invoicing.fields.legalName.description'),
                                                    },
                                                    {
                                                        type: 'text',
                                                        slug: 'invoice_vat_number',
                                                        label: t('company.payment.invoicing.fields.vatNumber.label'),
                                                        description: t('company.payment.invoicing.fields.vatNumber.description'),
                                                    },
                                                    {
                                                        type: 'text',
                                                        slug: 'invoice_address_line1',
                                                        label: t('company.payment.invoicing.fields.addressLine1.label'),
                                                        description: t('company.payment.invoicing.fields.addressLine1.description'),
                                                    },
                                                    {
                                                        type: 'text',
                                                        slug: 'invoice_address_line2',
                                                        label: t('company.payment.invoicing.fields.addressLine2.label'),
                                                        description: t('company.payment.invoicing.fields.addressLine2.description'),
                                                    },
                                                    {
                                                        type: 'text',
                                                        slug: 'invoice_postal_code',
                                                        label: t('company.payment.invoicing.fields.postalCode.label'),
                                                        description: t('company.payment.invoicing.fields.postalCode.description'),
                                                    },
                                                    {
                                                        type: 'text',
                                                        slug: 'invoice_city',
                                                        label: t('company.payment.invoicing.fields.city.label'),
                                                        description: t('company.payment.invoicing.fields.city.description'),
                                                    },
                                                    {
                                                        type: 'text',
                                                        slug: 'invoice_country',
                                                        label: t('company.payment.invoicing.fields.country.label'),
                                                        description: t('company.payment.invoicing.fields.country.description'),
                                                    },
                                                    {
                                                        type: 'text',
                                                        slug: 'invoice_email_cc',
                                                        label: t('company.payment.invoicing.fields.emailCc.label'),
                                                        description: t('company.payment.invoicing.fields.emailCc.description'),
                                                    },
                                                    {
                                                        type: 'textarea',
                                                        slug: 'invoice_footer',
                                                        label: t('company.payment.invoicing.fields.footer.label'),
                                                        description: t('company.payment.invoicing.fields.footer.description'),
                                                        descriptionPosition: 'above',
                                                    },
                                                ],
                                            },
                                            {
                                                type: 'ui',
                                                render: <InvoiceSettingsLivePreview />,
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'ui',
                                render: <Divider />,
                            },
                            {
                                type: 'form',
                                id: 'company-tax-form',
                                header: (
                                    <>
                                        <Text className="text-2xl font-bold">{t('company.payment.taxes.header')}</Text>
                                        <Muted>{t('company.payment.taxes.headerDescription')}</Muted>
                                    </>
                                ),
                                submitButton: {
                                    text: t('company.payment.taxes.submit'),
                                },
                                settings: [
                                    {
                                        type: 'boolean',
                                        slug: 'tax_enabled',
                                        label: t('company.payment.taxes.toggle.label'),
                                        description: t('company.payment.taxes.toggle.description'),
                                    },
                                    {
                                        type: 'ui',
                                        render: <OrganizationTaxesSetting />,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        slug: 'discounts',
                        title: t('company.discounts.pageTitle'),
                        icon: 'Tag',
                        description: t('company.discounts.pageDescription'),
                        settings: [
                            {
                                type: 'ui',
                                render: <OrganizationDiscountsSetting />,
                            },
                        ],
                    },
                ]
            },
            {
                group: 'notifications',
                label: t('groups.notifications'),
                settingsPages: [
                    {
                        slug: 'root',
                        title: t('company.notifications.notification.title'),
                        icon: 'Bell',
                        description: t('company.notifications.description'),
                        settings: [
                            {
                                type: 'form',
                                id: 'company-notifications-form',
                                header: (
                                    <>
                                        <Text className="text-2xl font-bold">{t('company.notifications.title')}</Text>
                                        <Muted>{t('company.notifications.description')}</Muted>
                                    </>
                                ),
                                submitButton: {
                                    text: t('company.notifications.submit'),
                                },
                                settings: [
                                    {   
                                        type: 'wrapper',
                                        className: 'max-w-3xl space-y-4',
                                        settings: [
                                            {
                                                type: 'ui',
                                                render: (
                                                    <Text className="text-lg font-medium">
                                                        {t('company.notifications.inApp.who.title')}
                                                    </Text>
                                                ),
                                            },
                                            {
                                                type: 'boolean',
                                                slug: 'in_app_booking_notify_attached_member',
                                                label: t('company.notifications.inApp.who.attachedMember.label'),
                                                description: t(
                                                    'company.notifications.inApp.who.attachedMember.description',
                                                ),
                                            },
                                            {
                                                type: 'boolean',
                                                slug: 'in_app_booking_notify_slot_admin',
                                                label: t('company.notifications.inApp.who.slotAdmin.label'),
                                                description: t(
                                                    'company.notifications.inApp.who.slotAdmin.description',
                                                ),
                                            },
                                            {
                                                type: 'ui',
                                                render: (
                                                    <Text className="pt-2 text-lg font-medium">
                                                        {t('company.notifications.inApp.when.title')}
                                                    </Text>
                                                ),
                                            },
                                            {
                                                type: 'boolean',
                                                slug: 'in_app_booking_notify_new_booking',
                                                label: t('company.notifications.inApp.when.newBooking.label'),
                                                description: t('company.notifications.inApp.when.newBooking.description'),
                                            },
                                            {
                                                type: 'boolean',
                                                slug: 'in_app_booking_notify_request_accepted',
                                                label: t('company.notifications.inApp.when.requestAccepted.label'),
                                                description: t(
                                                    'company.notifications.inApp.when.requestAccepted.description',
                                                ),
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        slug: 'email',
                        title: t('company.notifications.email.title'),
                        icon: 'Mail',
                        description: t('company.notifications.description'),
                        settings: [
                            {
                                type: 'form',
                                id: 'company-notifications-email-form',
                                submitButton: {
                                    text: t('company.notifications.submit'),
                                },
                                settings: [
                                    {
                                        type: 'wrapper',
                                        className: 'grid gap-8 xl:grid-cols-[auto_1fr] xl:items-start',
                                        settings: [
                                            {
                                                type: 'wrapper',
                                                className: 'space-y-4',
                                                settings: [
                                                    {
                                                        type: 'ui',
                                                        render: (
                                                            <Text className="text-xl font-semibold">
                                                                {t('company.notifications.email.title')}
                                                            </Text>
                                                        ),
                                                    },
                                                    {
                                                        type: 'boolean',
                                                        slug: 'disable_email',
                                                        label: t('company.notifications.email.disableEmail.label'),
                                                        description: t('company.notifications.email.disableEmail.description'),
                                                    },
                                                    {
                                                        type: 'boolean',
                                                        slug: 'disable_email_client_new_booking',
                                                        label: t('company.notifications.email.disableEmailClientNewBooking.label'),
                                                        description: t(
                                                            'company.notifications.email.disableEmailClientNewBooking.description',
                                                        ),
                                                    },
                                                    {
                                                        type: 'boolean',
                                                        slug: 'disable_email_client_booking_canceled',
                                                        label: t(
                                                            'company.notifications.email.disableEmailClientBookingCanceled.label',
                                                        ),
                                                        description: t(
                                                            'company.notifications.email.disableEmailClientBookingCanceled.description',
                                                        ),
                                                    },
                                                    {
                                                        type: 'boolean',
                                                        slug: 'disable_email_client_request_response',
                                                        label: t(
                                                            'company.notifications.email.disableEmailClientRequestResponse.label',
                                                        ),
                                                        description: t(
                                                            'company.notifications.email.disableEmailClientRequestResponse.description',
                                                        ),
                                                    },
                                                    {
                                                        type: 'boolean',
                                                        slug: 'disable_email_admin_new_booking',
                                                        label: t('company.notifications.email.disableEmailAdminNewBooking.label'),
                                                        description: t(
                                                            'company.notifications.email.disableEmailAdminNewBooking.description',
                                                        ),
                                                    },
                                                    {
                                                        type: 'email_provider_setting',
                                                        slug: 'email_provider',
                                                        label: t('company.notifications.email.emailProvider.label'),
                                                        description: t('company.notifications.email.emailProvider.description'),
                                                        descriptionPosition: 'above',
                                                    },
                                                    {
                                                        type: 'text',
                                                        slug: 'email_displayed_name',
                                                        label: t('company.notifications.email.emailDisplayName.label'),
                                                        description: t(
                                                            'company.notifications.email.emailDisplayName.description',
                                                        ),
                                                    },
                                                    {
                                                        type: 'textarea',
                                                        slug: 'email_content',
                                                        label: t('company.notifications.email.emailMessage.label'),
                                                        description: t('company.notifications.email.emailMessage.description'),
                                                        descriptionPosition: 'above',
                                                    },
                                                    {
                                                        type: 'email_theme_cards',
                                                        slug: 'email_template_theme',
                                                        label: t('company.notifications.email.emailTheme.label'),
                                                        description: t('company.notifications.email.emailTheme.description'),
                                                        options: [
                                                            {
                                                                label: t(
                                                                    'company.notifications.email.emailTheme.options.default',
                                                                ),
                                                                value: 'default',
                                                            },
                                                            {
                                                                label: t(
                                                                    'company.notifications.email.emailTheme.options.apple',
                                                                ),
                                                                value: 'apple',
                                                            },
                                                            {
                                                                label: t(
                                                                    'company.notifications.email.emailTheme.options.solid',
                                                                ),
                                                                value: 'solid',
                                                            },
                                                            {
                                                                label: t(
                                                                    'company.notifications.email.emailTheme.options.lithium',
                                                                ),
                                                                value: 'lithium',
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        type: 'select',
                                                        slug: 'email_template_font',
                                                        label: t('company.notifications.email.emailFont.label'),
                                                        description: t('company.notifications.email.emailFont.description'),
                                                        options: [
                                                            {
                                                                label: t(
                                                                    'company.notifications.email.emailFont.options.outfit',
                                                                ),
                                                                value: 'outfit',
                                                            },
                                                            {
                                                                label: t(
                                                                    'company.notifications.email.emailFont.options.inter',
                                                                ),
                                                                value: 'inter',
                                                            },
                                                            {
                                                                label: t(
                                                                    'company.notifications.email.emailFont.options.roboto',
                                                                ),
                                                                value: 'roboto',
                                                            },
                                                            {
                                                                label: t(
                                                                    'company.notifications.email.emailFont.options.openSans',
                                                                ),
                                                                value: 'open_sans',
                                                            },
                                                            {
                                                                label: t(
                                                                    'company.notifications.email.emailFont.options.lato',
                                                                ),
                                                                value: 'lato',
                                                            },
                                                            {
                                                                label: t(
                                                                    'company.notifications.email.emailFont.options.poppins',
                                                                ),
                                                                value: 'poppins',
                                                            },
                                                            {
                                                                label: t(
                                                                    'company.notifications.email.emailFont.options.montserrat',
                                                                ),
                                                                value: 'montserrat',
                                                            },
                                                            {
                                                                label: t(
                                                                    'company.notifications.email.emailFont.options.merriweather',
                                                                ),
                                                                value: 'merriweather',
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        type: 'color',
                                                        slug: 'email_template_background_color',
                                                        label: t('company.notifications.email.emailBackgroundColor.label'),
                                                        description: t(
                                                            'company.notifications.email.emailBackgroundColor.description',
                                                        ),
                                                    },
                                                    {
                                                        type: 'ui',
                                                        render: (
                                                            <Text className="pt-3 text-lg font-semibold">
                                                                {t('company.notifications.email.footer.title')}
                                                            </Text>
                                                        ),
                                                    },
                                                    {
                                                        type: 'text',
                                                        slug: 'email_template_footer_email',
                                                        label: t('company.notifications.email.footer.email.label'),
                                                        description: t('company.notifications.email.footer.email.description'),
                                                    },
                                                    {
                                                        type: 'text',
                                                        slug: 'email_template_footer_address',
                                                        label: t('company.notifications.email.footer.address.label'),
                                                        description: t(
                                                            'company.notifications.email.footer.address.description',
                                                        ),
                                                    },
                                                    {
                                                        type: 'text',
                                                        slug: 'email_template_footer_vat_number',
                                                        label: t('company.notifications.email.footer.vatNumber.label'),
                                                        description: t(
                                                            'company.notifications.email.footer.vatNumber.description',
                                                        ),
                                                    },
                                                    {
                                                        type: 'textarea',
                                                        slug: 'email_template_footer_links',
                                                        label: t('company.notifications.email.footer.links.label'),
                                                        description: t('company.notifications.email.footer.links.description'),
                                                        placeholder: t('company.notifications.email.footer.links.placeholder'),
                                                        descriptionPosition: 'above',
                                                    },
                                                    {
                                                        type: 'textarea',
                                                        slug: 'email_template_footer_custom_text',
                                                        label: t('company.notifications.email.footer.customText.label'),
                                                        description: t(
                                                            'company.notifications.email.footer.customText.description',
                                                        ),
                                                        descriptionPosition: 'above',
                                                    },
                                                    {
                                                        type: 'boolean',
                                                        slug: 'email_template_show_faq',
                                                        label: t('company.notifications.email.showFaq.label'),
                                                        description: t('company.notifications.email.showFaq.description'),
                                                    },
                                                ],
                                            },
                                            {
                                                type: 'ui',
                                                render: <EmailSettingsLivePreview />,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        slug: 'sms',
                        title: t('company.notifications.sms.title'),
                        icon: 'MessageSquare',
                        description: t('company.notifications.description'),
                        settings: [
                            {
                                type: 'form',
                                id: 'company-notifications-sms-form',
                                submitButton: {
                                    text: t('company.notifications.submit'),
                                },
                                settings: [
                                    {
                                        type: 'wrapper',
                                        className: 'grid gap-8 xl:grid-cols-[auto_1fr] xl:items-start',
                                        settings: [
                                            {
                                                type: 'wrapper',
                                                className: 'space-y-4',
                                                settings: [
                                                    {
                                                        type: 'ui',
                                                        render: (
                                                            <Text className="pt-3 text-xl font-semibold">
                                                                {t('company.notifications.sms.title')}
                                                            </Text>
                                                        ),
                                                    },
                                                    {
                                                        type: 'boolean',
                                                        slug: 'disable_sms',
                                                        label: t('company.notifications.sms.disableSms.label'),
                                                        description: t('company.notifications.sms.disableSms.description'),
                                                    },
                                                    {
                                                        type: 'reminder_delay_setting',
                                                        slug: 'sms_delay',
                                                        label: t('company.notifications.sms.smsDelay.label'),
                                                        description: t('company.notifications.sms.smsDelay.description'),
                                                        descriptionPosition: 'above',
                                                        defaultDays: 2,
                                                        defaultHours: 0,
                                                    },
                                                    {
                                                        type: 'sms_provider_setting',
                                                        slug: 'sms_provider',
                                                        label: t('company.notifications.sms.smsProvider.label'),
                                                        description: t('company.notifications.sms.smsProvider.description'),
                                                        descriptionPosition: 'above',
                                                    },
                                                    {
                                                        type: 'sms_template_textarea',
                                                        slug: 'sms_header',
                                                        label: t('company.notifications.sms.smsHeader.label'),
                                                        description: t('company.notifications.sms.smsHeader.description'),
                                                        descriptionPosition: 'above',
                                                        placeholder: t('company.notifications.sms.smsHeader.placeholder'),
                                                    },
                                                    {
                                                        type: 'sms_template_textarea',
                                                        slug: 'sms_content',
                                                        label: t('company.notifications.sms.smsMessage.label'),
                                                        description: t('company.notifications.sms.smsMessage.description'),
                                                        descriptionPosition: 'above',
                                                        placeholder: t('company.notifications.sms.smsMessage.placeholder'),
                                                    },
                                                    {
                                                        type: 'sms_template_textarea',
                                                        slug: 'sms_footer',
                                                        label: t('company.notifications.sms.smsFooter.label'),
                                                        description: t('company.notifications.sms.smsFooter.description'),
                                                        descriptionPosition: 'above',
                                                        placeholder: t('company.notifications.sms.smsFooter.placeholder'),
                                                    },
                                                    {
                                                        type: 'text',
                                                        slug: 'whatsapp_phone',
                                                        label: t('company.notifications.sms.whatsappPhone.label'),
                                                        description: t('company.notifications.sms.whatsappPhone.description'),
                                                    },
                                                ]
                                            },
                                            {
                                                type: 'ui',
                                                render: <SmsSettingsLivePreview />,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        slug: 'google-agenda',
                        title: t('company.notifications.googleAgenda.title'),
                        icon: 'Calendar',
                        description: t('company.notifications.googleAgenda.description'),
                        settings: [
                            {
                                type: 'wrapper',
                                settings: [
                                    {
                                        type: 'ui',
                                        render: (
                                            <View className="max-w-4xl space-y-4">
                                                <View className="space-y-1">
                                                    <Text className="text-2xl font-bold">
                                                        {t('company.notifications.googleAgenda.title')}
                                                    </Text>
                                                    <Muted>{t('company.notifications.googleAgenda.description')}</Muted>
                                                </View>
                                                <GoogleCalendarSyncSetting />
                                            </View>
                                        ),
                                    },
                                ]
                            },
                        ],
                    },
                ],
            },
            {
                group: 'organization',
                label: t('groups.company'),
                settingsPages: [
                    {
                        slug: 'index',
                        title: t('company.general.title'),
                        icon: 'Settings',
                        description: t('company.general.description'),
                        settings: [
                            {
                                type: 'form',
                                id: 'organization-info-form',
                                header: (
                                    <>
                                        <Text className="text-2xl font-bold">
                                            {orgT('index.organizationInfo.title')}
                                        </Text>
                                        <Muted>{orgT('index.organizationInfo.titleDescription')}</Muted>
                                    </>
                                ),
                                submitButton: {
                                    text: orgT('index.organizationInfo.submit'),
                                },
                                settings: [
                                    {
                                        type: 'wrapper',
                                        className:
                                            'p-0 sm:px-0 flex flex-col gap-4 md:flex-row md:justify-start md:gap-8 space-y-0',
                                        settings: [
                                            {
                                                type: 'organization_media',
                                                slug: 'organization_logo_url',
                                                label: orgT('index.organizationInfo.logo.label'),
                                                triggerClassName: 'h-32 w-32 rounded-lg',
                                                imageClassName: 'w-full h-full object-cover',
                                                placeholder: (
                                                    <Icon
                                                        name="Store"
                                                        className="text-muted-foreground h-12 w-12"
                                                    />
                                                ),
                                            },

                                            {
                                                type: 'wrapper',
                                                className: 'p-0 flex-1 max-w-lg sm:px-0',
                                                settings: [
                                                    {
                                                        type: 'text',
                                                        slug: 'organization_name',
                                                        label: orgT('index.organizationInfo.name.label'),
                                                        description: orgT('index.organizationInfo.name.description'),
                                                        placeholder: orgT('index.organizationInfo.name.placeholder'),
                                                    },
                                                    {
                                                        type: 'text',
                                                        slug: 'organization_website',
                                                        label: orgT('index.organizationInfo.website.label'),
                                                        placeholder: orgT(
                                                            'index.organizationInfo.website.placeholder',
                                                        ),
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        type: 'textarea',
                                        slug: 'organization_description',
                                        label: orgT('index.organizationInfo.description.label'),
                                        description: orgT('index.organizationInfo.description.description'),
                                    },
                                    {
                                        type: 'organization_media',
                                        slug: 'organization_logo_name',
                                        label: t('company.general.logoName.label'),
                                        description: t('company.general.logoName.description'),
                                        descriptionPosition: 'above',
                                        triggerClassName: 'h-44 w-lg rounded-md',
                                        imageClassName: 'h-full w-full object-cover',
                                        placeholder: (
                                            <Icon
                                                name="Image"
                                                className="text-muted-foreground size-8"
                                            />
                                        ),
                                    },
                                    {
                                        type: 'wrapper',
                                        className: 'p-0 flex-1 max-w-2xl sm:px-0',
                                        settings: [
                                            {
                                                type: 'select',
                                                slug: 'organization_lang',
                                                label: t('company.general.language.label'),
                                                description: t('company.general.language.description'),
                                                options: [
                                                    {
                                                        label: t('company.general.language.options.english'),
                                                        value: 'en',
                                                    },
                                                    {
                                                        label: t('company.general.language.options.french'),
                                                        value: 'fr',
                                                    },
                                                ],
                                            },
                                            {
                                                type: 'timezone_setting',
                                                slug: 'organization_timezone',
                                                label: t('company.general.timezone.label'),
                                                description: t('company.general.timezone.description'),
                                            },
                                        ],
                                    },


                                ],
                            },
                            {
                                type: 'ui',
                                render: <Divider />,
                            },
                            {
                                type: 'form',
                                id: 'company-general-form',
                                header: (
                                    <>
                                        <Text className="text-2xl font-bold">Agenda settings</Text>
                                        <Muted>These data will be used in the agenda and checkout page to customize you user experience.</Muted>
                                    </>
                                ),
                                submitButton: {
                                    text: t('company.general.submit'),
                                },
                                settings: [
                                    {
                                        type: 'text',
                                        slug: 'sales_policy_url',
                                        label: t('company.general.salesPolicyUrl.label'),
                                        description: t('company.general.salesPolicyUrl.description'),
                                        placeholder: 'https://example.com/terms',
                                    },
                                    {
                                        type: 'wrapper',
                                        className: 'flex flex-col gap-0.5',
                                        settings: [
                                            {
                                                type: 'wrapper',
                                                className: 'flex gap-2 items-start mb-0 space-y-0',
                                                settings: [
                                                    {
                                                        type: 'hour_time',
                                                        slug: 'schedule_start_time',
                                                        label: t('company.general.openingTime'),
                                                    },
                                                    {
                                                        type: 'hour_time',
                                                        slug: 'schedule_end_time',
                                                        label: t('company.general.closingTime'),
                                                    },
                                                ],
                                            },
                                            {
                                                type: 'ui',
                                                render: (
                                                    <Text className="text-muted-foreground text-[0.8rem]">
                                                        {t('company.general.openingClosingDescription')}
                                                    </Text>
                                                )
                                            },
                                        ],
                                    },
                                    {
                                        type: 'color',
                                        slug: 'primary_color',
                                        label: t('company.general.primaryColor.label'),
                                        description: t('company.general.primaryColor.description'),
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    });
