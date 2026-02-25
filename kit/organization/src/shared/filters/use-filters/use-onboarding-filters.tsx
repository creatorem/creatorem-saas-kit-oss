'use client';

import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import type { authRouter } from '@kit/auth/router';
import type { Icon as NativeIcon } from '@kit/native-ui/icon';
import type { Icon as WebIcon } from '@kit/ui/icon';
import { AsyncFilterCallback, FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import {
    LogicInputConfig,
    QuickFormConfig,
    QuickFormInput,
    QuickFormInputConfig,
    QuickFormSchemaMap,
    QuickFormStepConfig,
    QuickFormUIComponent,
    QuickFormUIConfig,
    QuickFormWrapperConfig,
    SettingsInputsBase,
} from '@kit/utils/quick-form';
import type { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import z from 'zod';
import type { organizationRouter } from '../../../router/router';
import { OrgConfig } from '../../../config';

/* ONBOARDING SCHEMA */

const getOnboardingOrgCreationSchema = (t: TFunction<'p_org-onboarding'>) => ({
    orgLogoUrl: z.string().optional().nullable(),
    orgName: z.string().min(3, t('validation.minCharacters')),
    orgSlug: z.string().min(3, t('validation.minCharacters')),
});

const getOnboardingOrgSchema = (t: TFunction<'p_org-onboarding'>) => ({
    ...getOnboardingOrgCreationSchema(t),
    orgSize: z.enum(['1', '2-10', '11-50', '51-100', '+100']),
});

const ADD_ORGANIZATION_ONBOARDING_SCHEMAS = 'addOrganizationOnboardingSchemas';
const getAddOrganizationOnboardingSchemas =
    (t: TFunction<'p_org-onboarding'>): FilterCallback<'get_onboarding_schema'> =>
        (onboardingSchema) => {
            return {
                ...onboardingSchema,
                ...getOnboardingOrgSchema(t),
            };
        };

export const getUseOnboardingFilters = ({
    OrganizationSettingMedia,
    UserSettingMedia,
    PathPreview,
    Icon,
    getCreateOrgHeader,
    settingsPrefix,
}: {
    OrganizationSettingMedia: QuickFormInput<{
        triggerClassName?: string;
        imageClassName?: string;
        placeholder?: React.ReactNode;
    }>;
    UserSettingMedia: QuickFormInput<{
        triggerClassName?: string;
        imageClassName?: string;
        placeholder?: React.ReactNode;
    }>;
    PathPreview: React.FC<{ orgConfig: OrgConfig }>;
    Icon: typeof WebIcon | typeof NativeIcon;
    getCreateOrgHeader: (t: TFunction<'p_org-onboarding'>) => React.JSX.Element;
    settingsPrefix?: QuickFormUIComponent[];
}) => {
    /**
     * Enqueue all app events that need useOrganization to work.
     */
    return function useOnboardingFilters({ orgConfig }: { orgConfig: OrgConfig }) {
        const { t } = useTranslation('p_org-onboarding');
        const EXTRA_INPUTS = { organization_media: OrganizationSettingMedia, user_media: UserSettingMedia };
        const onboardingOrgCreationSchema = getOnboardingOrgCreationSchema(t);
        const onboardingOrgSchema = getOnboardingOrgSchema(t);

        /* STEPS CONFIG */

        const settingsForOrgCreation: (
            | QuickFormUIComponent
            | QuickFormInputConfig<typeof onboardingOrgCreationSchema, typeof EXTRA_INPUTS>
            | QuickFormWrapperConfig<typeof onboardingOrgCreationSchema, typeof EXTRA_INPUTS>
            | LogicInputConfig<typeof onboardingOrgCreationSchema, typeof EXTRA_INPUTS>
        )[] = [
                {
                    type: 'user_media',
                    slug: 'orgLogoUrl',
                    triggerClassName: 'size-32 rounded-full mx-auto',
                    imageClassName: 'w-full h-full object-cover',
                    placeholder: <Icon name="Store" className="text-muted-foreground h-12 w-12" />,
                },
                {
                    type: 'text',
                    slug: 'orgName',
                    label: t('fields.name.label'),
                },
                {
                    type: 'text',
                    slug: 'orgSlug',
                    label: t('fields.slug.label'),
                },
                {
                    type: 'ui',
                    render: <PathPreview orgConfig={orgConfig} />,
                },
            ];

        const ADD_ORGANIZATION_ONBOARDING_STEPS_CONFIG = 'addOrganizationOnboardingStepsConfig';
        const addOrganizationOnboardingStepsConfig: FilterCallback<'get_onboarding_steps_config'> = (
            onboardingSchema,
            { clientTrpc },
        ) => {
            const onboardingOrganizationStepsConfig: QuickFormStepConfig<
                typeof onboardingOrgSchema,
                typeof EXTRA_INPUTS
            >[] = [
                    {
                        type: 'step',
                        label: t('steps.organization.label'),
                        header: getCreateOrgHeader(t),
                        settings: [...(settingsPrefix ?? []), ...settingsForOrgCreation],
                        async canGoNext(form) {
                            const slug = form.getValues('orgSlug');
                            if (!slug || slug.length <= 3) return true; // will be blocked by form schema
                            const result = await (
                                clientTrpc as TrpcClientWithQuery<typeof organizationRouter>
                            ).checkIfSlugIsAvailable.fetch({ slug });
                            if (!result?.serverError && !result.isAvailable) {
                                form.setError('orgSlug', {
                                    type: 'validate',
                                    message: t('validation.slugTaken'),
                                });
                                return false;
                            }
                            return true;
                        },
                    },
                    {
                        type: 'step',
                        label: t('steps.size.label'),
                        settings: [
                            ...(settingsPrefix ?? []),
                            {
                                type: 'question_select',
                                slug: 'orgSize',
                                question: t('steps.size.question'),
                                answerClassName: 'items-center',
                                questionDescription: t('steps.size.description'),
                                answers: [
                                    {
                                        value: '1',
                                        label: t('steps.size.answers.justMe'),
                                    },
                                    {
                                        value: '2-10',
                                        label: t('steps.size.answers.2-10'),
                                    },
                                    {
                                        value: '11-50',
                                        label: t('steps.size.answers.11-50'),
                                    },
                                    {
                                        value: '51-100',
                                        label: t('steps.size.answers.51-100'),
                                    },
                                    {
                                        value: '+100',
                                        label: t('steps.size.answers.+100'),
                                    },
                                ],
                            },
                        ],
                    },
                ];
            return [
                ...onboardingSchema,
                ...(onboardingOrganizationStepsConfig as unknown as QuickFormStepConfig<
                    QuickFormSchemaMap,
                    SettingsInputsBase
                >[]),
            ];
        };

        const ADD_ORGANIZATION_EXTRA_INPUTS = 'addOrganizationExtraInputs';
        const addOrganizationExtraInputs: FilterCallback<'get_onboarding_extra_inputs'> = (extraInputs) => ({
            ...extraInputs,
            ...EXTRA_INPUTS,
        });

        const HANDLE_ORGANIATION_ONBOARDING_SUBMIT = 'handleOrganizationOnboardingSubmit';
        const handleOrganizationOnboardingSubmit: AsyncFilterCallback<'on_onboarding_submit'> = async (
            url,
            { data, clientTrpc, queryClient },
        ) => {
            const parsedData = z.object(onboardingOrgSchema).parse(data);
            await (clientTrpc as TrpcClientWithQuery<typeof organizationRouter>).createOrganization.fetch(parsedData);
            await queryClient.refetchQueries({
                queryKey: [
                    (clientTrpc as TrpcClientWithQuery<typeof organizationRouter>).organizationUserMemberships.key,
                ],
            });

            return `${url}?slug=${parsedData.orgSlug}`;
        };

        /* ONBOARDING PATH */

        const renderOrganizationCreationFrom = ({
            queryClient,
            clientTrpc,
        }: Parameters<FilterCallback<'render_onboarding_path'>>[1]): ReturnType<
            FilterCallback<'render_onboarding_path'>
        > => {
            const config: QuickFormConfig<typeof onboardingOrgCreationSchema, typeof EXTRA_INPUTS> = {
                id: 'onboarding',
                title: t('paths.createOrganization.title'),
                description: t('paths.createOrganization.description'),
                submitButton: { text: t('paths.createOrganization.submit'), className: 'ml-auto' },
                schema: onboardingOrgCreationSchema,
                onSubmit: async (form) => {
                    console.log('onSubmit from the onSubmit checker');
                    const slug = form.getValues('orgSlug');
                    if (!slug || slug.length <= 3) return;
                    const result = await (
                        clientTrpc as TrpcClientWithQuery<typeof organizationRouter>
                    ).checkIfSlugIsAvailable.fetch({ slug });
                    if (!result?.serverError && !result.isAvailable) {
                        form.setError('orgSlug', {
                            type: 'validate',
                            message: t('validation.slugTaken'),
                        });
                        throw new Error(t('validation.slugTaken'));
                    }
                },
                settings: settingsForOrgCreation,
            };

            const handleSubmit = async (data: unknown) => {
                console.log('handleSubmit in org creation');
                const parsedData = z.object(onboardingOrgCreationSchema).parse(data);
                await (clientTrpc as TrpcClientWithQuery<typeof organizationRouter>).createOrganization.fetch(
                    parsedData,
                );

                await queryClient.refetchQueries({
                    queryKey: [
                        (clientTrpc as TrpcClientWithQuery<typeof organizationRouter>).organizationUserMemberships.key,
                    ],
                });
                await queryClient.refetchQueries({
                    queryKey: [
                        (clientTrpc as TrpcClientWithQuery<typeof organizationRouter>).getOrganizationSession.key,
                    ],
                });
            };

            return {
                config: config as unknown as QuickFormConfig<QuickFormSchemaMap>,
                inputs: EXTRA_INPUTS,
                onSubmit: handleSubmit,
            };
        };

        const renderUserCreationFrom = ({
            queryClient,
            clientTrpc,
            defaultSchema,
            defaultSteps,
        }: Parameters<FilterCallback<'render_onboarding_path'>>[1]): ReturnType<
            FilterCallback<'render_onboarding_path'>
        > => {
            const config: QuickFormConfig<typeof defaultSchema, typeof EXTRA_INPUTS> = {
                id: 'new-user',
                title: t('paths.createProfile.title'),
                description: t('paths.createProfile.description'),
                submitButton: { text: t('paths.createProfile.submit'), className: 'ml-auto' },
                schema: defaultSchema,
                settings: defaultSteps as unknown as QuickFormUIConfig<typeof defaultSchema, typeof EXTRA_INPUTS>[],
            };

            const handleSubmit = async (data: unknown) => {
                // @ts-expect-error
                const parsedData = z.object(defaultSchema).parse(data);
                // @ts-expect-error
                await (clientTrpc as TrpcClientWithQuery<typeof authRouter>).updateUser.fetch(parsedData);

                await queryClient.refetchQueries({
                    queryKey: [(clientTrpc as TrpcClientWithQuery<typeof authRouter>).getUser.key],
                });
            };

            return {
                config: config as unknown as QuickFormConfig<QuickFormSchemaMap>,
                inputs: EXTRA_INPUTS,
                onSubmit: handleSubmit,
            };
        };

        const RENDER_ORGANIZATION_ONBOARDING_PATH = 'renderOrganizationOnboardingPath';
        const renderOrganizationOnboardingPath: FilterCallback<'render_onboarding_path'> = (v, options) => {
            switch (options.onboardingPath) {
                case 'organization':
                    return renderOrganizationCreationFrom(options);
                case 'user':
                    return renderUserCreationFrom(options);
            }

            return null;
        };

        useEnqueueFilter('get_onboarding_schema', {
            name: ADD_ORGANIZATION_ONBOARDING_SCHEMAS,
            fn: getAddOrganizationOnboardingSchemas(t),
        });
        useEnqueueFilter('get_onboarding_steps_config', {
            name: ADD_ORGANIZATION_ONBOARDING_STEPS_CONFIG,
            fn: addOrganizationOnboardingStepsConfig,
        });
        useEnqueueFilter('get_onboarding_extra_inputs', {
            name: ADD_ORGANIZATION_EXTRA_INPUTS,
            fn: addOrganizationExtraInputs,
        });
        useEnqueueFilter('render_onboarding_path', {
            name: RENDER_ORGANIZATION_ONBOARDING_PATH,
            fn: renderOrganizationOnboardingPath,
        });

        useEnqueueFilter('on_onboarding_submit', {
            name: HANDLE_ORGANIATION_ONBOARDING_SUBMIT,
            fn: handleOrganizationOnboardingSubmit,
            async: true,
        });
    };
};
