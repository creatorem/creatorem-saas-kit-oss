import {
    AuthProviderZone,
    DangerZoneComponent,
    MultiFactorAuthList,
    SessionZoneComponent,
    UserSettingMedia,
} from '@kit/auth/www/user';
import { LanguageSelectorBase } from '@kit/i18n/www/ui/language-selector';
import { parseUISettingConfig } from '@kit/settings/ui-config';
import type { settingsSchemas } from '@kit/shared/config/settings.schema.config';
import { Separator } from '@kit/ui/separator';
import { Muted } from '@kit/ui/text';
import { dashboardRoutes } from '@kit/utils/config';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import { AvatarPlaceholder } from '~/components/avatar-placeholder';
import { authConfig } from './auth.config';
import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import type { AppRouter } from '@kit/shared/types/router';

export const EXTRA_INPUTS = {
    user_media: UserSettingMedia,
};

export const getSettingsUI = (t: TFunction<'settings'>, clientTrpc: TrpcClientWithQuery<AppRouter>) =>
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
                                        <div className="text-2xl font-bold">{t('profile.form.title')}</div>
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
                                                placeholder: <AvatarPlaceholder className="size-full text-6xl" />,
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
                                render: <Separator />,
                            },
                            {
                                type: 'form',
                                id: 'email-form',
                                header: (
                                    <>
                                        <div className="text-2xl font-bold">{t('profile.email.title')}</div>
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
                                            // Custom email confirmation logic
                                            if (values.user_email && values.confirm_email) {
                                                if (values.user_email !== values.confirm_email) {
                                                    throw new Error(t('profile.email.confirm.error.mismatch'));
                                                }
                                            }
                                            // If validation passes, the form will continue with normal submission
                                        },
                                    },
                                ],
                            },
                            {
                                type: 'ui',
                                render: <Separator />,
                            },
                            {
                                type: 'form',
                                id: 'appearance-form',
                                header: (
                                    <>
                                        <div className="text-2xl font-bold">{t('profile.appearance.title')}</div>
                                        <Muted>{t('profile.appearance.description')}</Muted>
                                    </>
                                ),
                                submitButton: {
                                    text: t('profile.appearance.submit'),
                                },
                                settings: [
                                    // appearance
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
                                            <div className="w-full max-w-lg">
                                                <LanguageSelectorBase />
                                            </div>
                                        ),
                                    },
                                ],
                            },
                            {
                                type: 'ui',
                                render: <Separator />,
                            },
                            {
                                type: 'wrapper',
                                settings: [
                                    {
                                        type: 'ui',
                                        render: <DangerZoneComponent className="max-w-4xl" clientTrpc={clientTrpc} />,
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
                                            <div className="max-w-4xl space-y-4">
                                                <div className="flex flex-col gap-2">
                                                    <div className="text-2xl font-bold">
                                                        {t('security.authentication.title')}
                                                    </div>
                                                    <Muted>{t('security.authentication.description')}</Muted>
                                                </div>
                                                <AuthProviderZone authConfig={authConfig} />
                                            </div>
                                        ),
                                    },
                                ],
                            },
                            {
                                type: 'ui',
                                render: <Separator />,
                            },
                            {
                                type: 'wrapper',
                                settings: [
                                    {
                                        type: 'ui',
                                        render: (
                                            <div className="max-w-4xl space-y-4">
                                                <div className="flex flex-col gap-2">
                                                    <div className="text-2xl font-bold">
                                                        {t('security.session.title')}
                                                    </div>
                                                    <Muted>{t('security.session.description')}</Muted>
                                                </div>
                                                <SessionZoneComponent
                                                    redirectTo={dashboardRoutes.paths.auth.signIn}
                                                    clientTrpc={clientTrpc}
                                                />
                                            </div>
                                        ),
                                    },
                                ],
                            },
                            {
                                type: 'ui',
                                render: <Separator />,
                            },
                            {
                                type: 'wrapper',
                                settings: [
                                    {
                                        type: 'ui',
                                        render: (
                                            <div className="max-w-4xl space-y-4">
                                                <div className="flex flex-col gap-2">
                                                    <div className="text-2xl font-bold">{t('security.mfa.title')}</div>
                                                    <Muted>{t('security.mfa.description')}</Muted>
                                                </div>
                                                <MultiFactorAuthList />
                                            </div>
                                        ),
                                    },
                                ],
                            },
                        ],
                    },
                    // notifications not implemented yet
                    // {
                    //     // match : "/notifications" endpoint
                    //     slug: 'notifications',
                    //     title: 'Notifications',
                    //     icon: <Icon name="Bell" className="h-4 w-4" />,
                    //     description: 'Configure how and when you receive notifications',
                    //     settings: [
                    //         {
                    //             type: 'wrapper',
                    //             settings: [
                    //                 {
                    //                     type: 'boolean',
                    //                     slug: 'email_notifications',
                    //                     label: 'Email Notifications',
                    //                     description: 'Receive notifications via email',
                    //                 },
                    //                 {
                    //                     type: 'boolean',
                    //                     slug: 'push_notifications',
                    //                     label: 'Push Notifications',
                    //                     description: 'Receive push notifications on your devices',
                    //                 },
                    //                 {
                    //                     type: 'radio',
                    //                     slug: 'notification_frequency',
                    //                     label: 'Notification Frequency',
                    //                     description: 'How often would you like to receive notifications?',
                    //                     options: [
                    //                         {
                    //                             label: 'Immediate',
                    //                             value: 'immediate',
                    //                         },
                    //                         {
                    //                             label: 'Daily Digest',
                    //                             value: 'daily',
                    //                         },
                    //                         {
                    //                             label: 'Weekly Digest',
                    //                             value: 'weekly',
                    //                         },
                    //                     ],
                    //                 },
                    //             ],
                    //         },
                    //     ],
                    // },
                ],
            },
        ],
    });
