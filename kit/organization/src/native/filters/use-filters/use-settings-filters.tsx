import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { UserSettingMedia } from '@kit/auth/native/user';
import { Icon } from '@kit/native-ui/icon';
import { parseUISettingConfig } from '@kit/settings/ui-config';
import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { organizationRouter } from '../../../router/router';
import { settingsOrgSchema } from '../../../shared/organization-settings-schema';
import {
    OrganizationMembersPage,
    OrganizationRolesPage,
    OrganizationSettingMedia,
    UserInvitationsPage,
} from '../../components';

const ADD_ORGANIZATION_SETTINGS_SCHEMAS = 'addOrganizationSettingsSchemas';
const addOrganizationSettingsSchemas: FilterCallback<'get_settings_schema'> = (settingsSchema) => {
    return {
        schema: {
            ...settingsSchema.schema,
            ...settingsOrgSchema,
        },
    };
};

const EXTRA_INPUTS = { organization_media: OrganizationSettingMedia, user_media: UserSettingMedia };

const ADD_ORGANIZATION_EXTRA_INPUTS = 'addOrganizationSettingsExtraInputs';
const addOrganizationSettingsExtraInputs: FilterCallback<'get_settings_extra_inputs'> = (extraInputs) => ({
    ...extraInputs,
    ...EXTRA_INPUTS,
});

/**
 * Enqueue all app events that need useOrganization to work.
 */
export function useSettingsFilters() {
    const { t } = useTranslation('p_org-settings');

    /* STEPS CONFIG */

    const ADD_ORGANIZATION_SETTINGS_UI_CONFIG = 'addOrganizationSettingsUIConfig';
    const addOrganizationSettingsUIConfig: FilterCallback<'get_settings_ui_config'> = (
        settingsSchema,
        { clientTrpc },
    ) => {
        const orgSettingsUI = parseUISettingConfig<typeof settingsOrgSchema, typeof EXTRA_INPUTS>({
            ui: [
                {
                    group: 'organization',
                    label: t('groups.organization'),
                    settingsPages: [
                        {
                            // match : "/advanced" endpoint
                            slug: 'index',
                            title: t('index.title'),
                            icon: 'Store',
                            description: t('index.description'),
                            settings: [
                                {
                                    type: 'form',
                                    id: 'organization-info-form',
                                    header: (
                                        <>
                                            <Text className="text-foreground text-2xl font-bold">
                                                {t('index.organizationInfo.title')}
                                            </Text>
                                            <Text className="text-muted-foreground text-sm">
                                                {t('index.organizationInfo.titleDescription')}
                                            </Text>
                                        </>
                                    ),
                                    submitButton: {
                                        text: t('index.organizationInfo.submit'),
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
                                                    label: t('index.organizationInfo.logo.label'),
                                                    triggerClassName: 'h-24 w-24 rounded-full',
                                                    imageClassName: 'w-full h-full object-cover',
                                                    placeholder: (
                                                        <View className="border-border flex size-full items-center justify-center rounded-full border border-dashed">
                                                            <Icon name="Store" size={20} />
                                                        </View>
                                                    ),
                                                },
                                                {
                                                    type: 'wrapper',
                                                    className: 'p-0 flex-1 max-w-lg sm:px-0',
                                                    settings: [
                                                        {
                                                            type: 'text',
                                                            slug: 'organization_name',
                                                            label: t('index.organizationInfo.name.label'),
                                                            description: t('index.organizationInfo.name.description'),
                                                            placeholder: t('index.organizationInfo.name.placeholder'),
                                                        },
                                                        {
                                                            type: 'text',
                                                            slug: 'organization_website',
                                                            label: t('index.organizationInfo.website.label'),
                                                            placeholder: t(
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
                                            label: t('index.organizationInfo.description.label'),
                                            description: t('index.organizationInfo.description.description'),
                                        },
                                        {
                                            type: 'text',
                                            slug: 'organization_address',
                                            label: t('index.organizationInfo.address.label'),
                                            placeholder: t('index.organizationInfo.address.placeholder'),
                                        },
                                        {
                                            type: 'text',
                                            slug: 'organization_email',
                                            label: t('index.organizationInfo.email.label'),
                                            placeholder: t('index.organizationInfo.email.placeholder'),
                                        },
                                    ],
                                },
                                // {
                                //     type: 'ui',
                                //     render: <Separator />,
                                // },
                                {
                                    type: 'form',
                                    id: 'organization-settings-form',
                                    header: (
                                        <>
                                            <Text className="text-foreground text-2xl font-bold">
                                                {t('index.additionalSettings.title')}
                                            </Text>
                                            <Text className="text-muted-foreground text-sm">
                                                {t('index.additionalSettings.description')}
                                            </Text>
                                        </>
                                    ),
                                    submitButton: {
                                        text: t('index.additionalSettings.submit'),
                                    },
                                    settings: [
                                        {
                                            type: 'text',
                                            slug: 'organization_industry',
                                            label: t('index.additionalSettings.industry.label'),
                                            placeholder: t('index.additionalSettings.industry.placeholder'),
                                        },
                                        {
                                            type: 'select',
                                            slug: 'organization_size',
                                            label: t('index.additionalSettings.size.label'),
                                            description: t('index.additionalSettings.size.description'),
                                            options: [
                                                {
                                                    label: t('index.additionalSettings.size.options.1-10'),
                                                    value: '1-10',
                                                },
                                                {
                                                    label: t('index.additionalSettings.size.options.11-50'),
                                                    value: '11-50',
                                                },
                                                {
                                                    label: t('index.additionalSettings.size.options.51-200'),
                                                    value: '51-200',
                                                },
                                                {
                                                    label: t('index.additionalSettings.size.options.201-500'),
                                                    value: '201-500',
                                                },
                                                {
                                                    label: t('index.additionalSettings.size.options.501-1000'),
                                                    value: '501-1000',
                                                },
                                                {
                                                    label: t('index.additionalSettings.size.options.1000+'),
                                                    value: '1000+',
                                                },
                                            ],
                                        },
                                        {
                                            type: 'text',
                                            slug: 'organization_country',
                                            label: t('index.additionalSettings.country.label'),
                                            placeholder: t('index.additionalSettings.country.placeholder'),
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            slug: 'members',
                            title: t('members.title'),
                            icon: 'Users',
                            description: t('members.description'),
                            settings: [
                                {
                                    type: 'wrapper',
                                    className: 'max-w-6xl',
                                    settings: [
                                        {
                                            type: 'ui',
                                            render: (
                                                <OrganizationMembersPage
                                                    clientTrpc={
                                                        clientTrpc as TrpcClientWithQuery<typeof organizationRouter>
                                                    }
                                                />
                                            ),
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            slug: 'roles',
                            title: t('roles.title'),
                            icon: 'Shield',
                            description: t('roles.description'),
                            settings: [
                                {
                                    type: 'wrapper',
                                    className: 'max-w-6xl',
                                    settings: [
                                        {
                                            type: 'ui',
                                            render: (
                                                <OrganizationRolesPage
                                                    clientTrpc={
                                                        clientTrpc as TrpcClientWithQuery<typeof organizationRouter>
                                                    }
                                                />
                                            ),
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        const [firstGroup, ...otherGroups] = settingsSchema.ui;

        return {
            ui: [
                ...(firstGroup
                    ? ([
                          {
                              ...firstGroup,
                              settingsPages: [
                                  ...firstGroup.settingsPages,
                                  {
                                      // match : "/invitations" endpoint
                                      slug: 'invitations',
                                      title: t('invitations.title'),
                                      icon: 'SendHorizontal',
                                      description: t('invitations.description'),
                                      settings: [
                                          {
                                              type: 'wrapper',
                                              className: 'max-w-6xl',
                                              settings: [
                                                  {
                                                      type: 'ui',
                                                      render: (
                                                          <View className="space-y-4">
                                                              <View className="flex flex-col gap-2">
                                                                  <Text className="text-foreground text-2xl font-bold">
                                                                      {t('invitations.content.title')}
                                                                  </Text>
                                                                  <Text className="text-muted-foreground text-sm">
                                                                      {t('invitations.content.description')}
                                                                  </Text>
                                                              </View>
                                                              <UserInvitationsPage
                                                                  clientTrpc={
                                                                      clientTrpc as TrpcClientWithQuery<
                                                                          typeof organizationRouter
                                                                      >
                                                                  }
                                                              />
                                                          </View>
                                                      ),
                                                  },
                                              ],
                                          },
                                      ],
                                  },
                              ],
                          },
                      ] as ReturnType<FilterCallback<'get_settings_ui_config'>>['ui'])
                    : []),
                ...otherGroups,
                ...(orgSettingsUI as unknown as ReturnType<FilterCallback<'get_settings_ui_config'>>).ui,
            ],
        };
    };

    useEnqueueFilter('get_settings_schema', {
        name: ADD_ORGANIZATION_SETTINGS_SCHEMAS,
        fn: addOrganizationSettingsSchemas,
    });
    useEnqueueFilter('get_settings_ui_config', {
        name: ADD_ORGANIZATION_SETTINGS_UI_CONFIG,
        fn: addOrganizationSettingsUIConfig,
        priority: 20,
    });
    useEnqueueFilter('get_settings_extra_inputs', {
        name: ADD_ORGANIZATION_EXTRA_INPUTS,
        fn: addOrganizationSettingsExtraInputs,
    });
}
