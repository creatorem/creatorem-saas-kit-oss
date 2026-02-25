import { AppClient } from '@kit/db';
import { SettingSchemaMap } from '@kit/settings/shared';
import { SettingServerModel } from '@kit/settings/shared/server/setting-server-model';
import { applyServerFilter } from '@kit/utils/filters/server';
import { KEYBINDINGS_SETTING_NAME } from '../storage/settings-storage/settings';

export const resetKeybindingsAction =
    (schemaConfig: { schema: SettingSchemaMap<string> }) =>
    async ({ db }: { db: AppClient }) => {
        const fullSchemaConfig = applyServerFilter('server_get_settings_schema', schemaConfig);
        const serverConfig = applyServerFilter('server_get_settings_server_config', { providers: {} });

        const settingsModel = new SettingServerModel(async () => db, serverConfig, fullSchemaConfig);

        await settingsModel.updateSettings({ [KEYBINDINGS_SETTING_NAME]: {} });

        return { success: true };
    };
