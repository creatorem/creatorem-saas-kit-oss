'use client';

import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Muted } from '@kit/ui/text';
import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { useTranslation } from 'react-i18next';
import { getKeybindingsRouter } from '../router/router';
import { DatabaseKeybindingsStorage } from '../storage/settings-storage/handler';
import { KEYBINDINGS_SETTING_NAME, KEYBINDINGS_SETTINGS_SCHEMA } from '../storage/settings-storage/settings';
import { KeybindingsProvider, KeybindingsTable } from '../ui';

const ADD_KEYBINDINGS_SETTINGS_SCHEMAS = 'addKeybindingsSettingsSchemas';
const addKeybindingsSettingsSchemas: FilterCallback<'get_settings_schema'> = (settingsSchema) => {
    return {
        schema: {
            ...settingsSchema.schema,
            [KEYBINDINGS_SETTING_NAME]: {
                schema: KEYBINDINGS_SETTINGS_SCHEMA,
                storage: 'user_settings',
            },
        },
    };
};

/**
 * Enqueue all app events that need useOrganization to work.
 */
export default function useKeybindingsFilters() {
    const ADD_KEYBINDINGS_PROVIDER = 'addMonitoringProvider';
    const addMonitoringProvider: FilterCallback<'display_trpc_provider_child_in_dashboard'> = (
        children,
        { url, keybindingsModel, clientTrpc },
    ) => {
        if (!keybindingsModel || !url || !clientTrpc) {
            return children;
        }

        const navigationUrlTransformers = [
            (urlString: string) => (urlString.includes('[slug]') ? url(urlString) : urlString),
        ];

        const keybindingsStorage = new DatabaseKeybindingsStorage(
            clientTrpc as TrpcClientWithQuery<ReturnType<typeof getKeybindingsRouter>>,
        );

        return (
            <KeybindingsProvider
                model={keybindingsModel}
                storage={keybindingsStorage}
                navigationUrlTransformers={navigationUrlTransformers}
            >
                {children}
            </KeybindingsProvider>
        );
    };

    useEnqueueFilter('display_trpc_provider_child_in_dashboard', {
        name: ADD_KEYBINDINGS_PROVIDER,
        fn: addMonitoringProvider,
    });

    /* settings */

    const { t } = useTranslation('p_keybindings');

    const ADD_KEYBINDINGS_SETTINGS_UI_CONFIG = 'addKeybindingsSettingsUIConfig';
    const addKeybindingsSettingsUIConfig: FilterCallback<'get_settings_ui_config'> = (settingsSchema) => {
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
                                    // match : "/keybindings" endpoint
                                    slug: 'keybindings',
                                    title: t('settings.title'),
                                    icon: 'Keyboard',
                                    description: t('settings.description'),
                                    settings: [
                                        {
                                            type: 'wrapper',
                                            className: 'max-w-6xl',
                                            settings: [
                                                {
                                                    type: 'ui',
                                                    render: (
                                                        <div className="space-y-4">
                                                            <div className="flex flex-col gap-2">
                                                                <div className="text-2xl font-bold">
                                                                    {t('settings.shortcuts.title')}
                                                                </div>
                                                                <Muted>{t('settings.shortcuts.description')}</Muted>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="text-muted-foreground text-xs">
                                                                    {t('settings.shortcuts.info')}
                                                                </div>
                                                                <KeybindingsTable />
                                                            </div>
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
                ...otherGroups,
            ],
        };
    };

    useEnqueueFilter('get_settings_ui_config', {
        name: ADD_KEYBINDINGS_SETTINGS_UI_CONFIG,
        fn: addKeybindingsSettingsUIConfig,
        priority: 5,
    });

    useEnqueueFilter('get_settings_schema', {
        name: ADD_KEYBINDINGS_SETTINGS_SCHEMAS,
        fn: addKeybindingsSettingsSchemas,
    });
}
