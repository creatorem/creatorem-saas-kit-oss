import { applyFilter } from '@kit/utils/filters';
import { parseUISettingConfig } from '@kit/settings/ui-config';
import { useCtxTrpc } from '@planoby/shared/trpc-client-provider';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getSettingsUI } from '~/config/settings.ui.config';

export const useSettingsUiConfig = () => {
    const { clientTrpc } = useCtxTrpc();
    const { t } = useTranslation('settings');
    const { t: orgT } = useTranslation('p_org-settings');

    return useMemo(() => {
        const settingsUI = getSettingsUI(t, orgT, clientTrpc);
        const filteredConfig = applyFilter(
            'get_settings_ui_config',
            settingsUI as unknown as ReturnType<typeof parseUISettingConfig>,
            {
                clientTrpc,
            },
        );

        return filteredConfig ?? settingsUI;
    }, [t, orgT, clientTrpc]);
};
