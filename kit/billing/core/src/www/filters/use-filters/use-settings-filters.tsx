'use client';

import { BillingConfig } from '@kit/billing';
import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { useTranslation } from 'react-i18next';
import { BillingPage } from '../../../react/billing-page';
import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { billingRouter } from '../../../router/router';

/**
 * Enqueue all app events that need useOrganization to work.
 */
export function useSettingsFilters({ billingConfig }: { billingConfig: BillingConfig; }) {
    const { t } = useTranslation('p_billing');

    /* STEPS CONFIG */

    const ADD_BILLING_SETTINGS_UI_CONFIG = 'addBillingSettingsUIConfig';
    const addBillingSettingsUIConfig: FilterCallback<'get_settings_ui_config'> = (
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
                                    slug: 'billing',
                                    title: t('settings.title'),
                                    icon: 'CreditCard',
                                    description: t('settings.description'),
                                    settings: [
                                        {
                                            type: 'wrapper',
                                            className: 'p-0 sm:px-0 space-y-0',
                                            settings: [
                                                {
                                                    type: 'ui',
                                                    render: <BillingPage config={billingConfig} clientTrpc={clientTrpc as TrpcClientWithQuery<typeof billingRouter>} />,
                                                },
                                            ],
                                        },
                                    ],
                                }
                            ],
                        },
                    ] as ReturnType<FilterCallback<'get_settings_ui_config'>>['ui'])
                    : []),
            ],
        };
    };

    useEnqueueFilter('get_settings_ui_config', {
        name: ADD_BILLING_SETTINGS_UI_CONFIG,
        fn: addBillingSettingsUIConfig,
        // after org (20) and before ai (40) 
        priority: 30,
    });
}
