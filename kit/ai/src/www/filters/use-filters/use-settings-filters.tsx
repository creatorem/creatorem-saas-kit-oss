'use client';

import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Muted } from '@kit/ui/text';
import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { useTranslation } from 'react-i18next';
import { AiConfig } from '../../../config';
import { aiRouter } from '../../../router/router';
import { UserAiPlanUsage } from '../../../components/settings/user-ai-plan-usage';

export function useSettingsFilters({ aiConfig }: { aiConfig: AiConfig }) {
    const { t } = useTranslation('p_ai');

    const ADD_AI_SETTINGS_UI_CONFIG = 'addAiSettingsUIConfig';
    const addAiSettingsUIConfig: FilterCallback<'get_settings_ui_config'> = (
        settingsSchema,
        { clientTrpc },
    ) => {
        const otherGroups = settingsSchema.ui.slice(0, -1);
        const lastGroup = settingsSchema.ui.at(-1);

        return {
            ui: [
                ...otherGroups,
                ...(lastGroup
                    ? ([
                        {
                            ...lastGroup,
                            settingsPages: [
                                ...lastGroup.settingsPages,
                                {
                                    slug: 'usage',
                                    title: t('usage.title'),
                                    icon: 'ChartNoAxesCombined',
                                    description: t('usage.description'),
                                    settings: [
                                        {
                                            type: 'wrapper',
                                            settings: [
                                                {
                                                    type: 'ui',
                                                    render: (
                                                        <div className="space-y-4">
                                                            <div className="flex flex-col gap-2">
                                                                <div className="text-2xl font-bold">
                                                                    {t('usage.aiUsage.title')}
                                                                </div>
                                                                <Muted>{t('usage.aiUsage.description')}</Muted>
                                                            </div>
                                                            <UserAiPlanUsage
                                                                clientTrpc={
                                                                    clientTrpc as TrpcClientWithQuery<typeof aiRouter>
                                                                }
                                                                aiConfig={aiConfig}
                                                            />
                                                        </div>
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
            ],
        };
    };

    useEnqueueFilter('get_settings_ui_config', {
        name: ADD_AI_SETTINGS_UI_CONFIG,
        fn: addAiSettingsUIConfig,
        priority: 40,
    });
}
