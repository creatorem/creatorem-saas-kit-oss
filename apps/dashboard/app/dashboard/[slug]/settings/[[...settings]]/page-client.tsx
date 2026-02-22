'use client';

import { SettingsPages } from '@kit/settings/www/ui';
import { settingsSchemas } from '@kit/shared/config/settings.schema.config';
import { useCtxTrpc } from '@kit/shared/trpc-client-provider';
import { cn } from '@kit/utils';
import { useApplyFilter } from '@kit/utils/filters';
import { SettingWrapperComponent } from '@kit/utils/quick-form';
import { EXTRA_INPUTS } from '~/config/settings.ui.config';
import { useSettingsUiConfig } from '~/hooks/use-settings-ui-config';

const Wrapper: SettingWrapperComponent = ({ className, header, children }) => {
    return (
        <div className={cn('space-y-4 px-4 py-8 sm:px-8', className)}>
            {header && <div className="space-y-2">{header}</div>}
            {children}
        </div>
    );
};

export function ClientSettingsPage({ awaitedParams }: { awaitedParams: any }) {
    const { clientTrpc } = useCtxTrpc();

    const settingsConfig = useSettingsUiConfig();

    const filteredSettingsSchema = useApplyFilter('get_settings_schema', settingsSchemas) as typeof settingsSchemas;
    const extraInputs = useApplyFilter('get_settings_extra_inputs', EXTRA_INPUTS);

    return (
        <SettingsPages
            inputs={extraInputs}
            clientTrpc={clientTrpc}
            settingsUI={settingsConfig}
            settingsSchemas={filteredSettingsSchema}
            Wrapper={Wrapper}
            params={awaitedParams}
        />
    );
}
