'use client';

import { parseUISettingConfig } from '@kit/settings/ui-config';
import { useCtxTrpc } from '@kit/shared/trpc-client-provider';
import { applyFilter } from '@kit/utils/filters';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getSettingsUI } from '~/config/settings.ui.config';

export const useSettingsUiConfig = () => {
    const { clientTrpc } = useCtxTrpc();
    const { t } = useTranslation('settings');

    return useMemo(() => {
        const settingsUI = getSettingsUI(t, clientTrpc);

        const config = applyFilter(
            'get_settings_ui_config',
            settingsUI as unknown as ReturnType<typeof parseUISettingConfig>,
            {
                clientTrpc,
            },
        );
        
        return config;
    }, [t, clientTrpc]);
};
