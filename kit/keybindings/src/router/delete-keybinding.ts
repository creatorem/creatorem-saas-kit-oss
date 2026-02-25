import { AppClient } from '@kit/db';
import { SettingSchemaMap } from '@kit/settings/shared';
import { SettingServerModel } from '@kit/settings/shared/server/setting-server-model';
import { applyServerFilter } from '@kit/utils/filters/server';
import z from 'zod';
import { KEYBINDINGS_SETTING_NAME } from '../storage/settings-storage/settings';

export const deleteKeybindingSchema = z.object({
    actionId: z.string(),
});

export const deleteKeybindingAction =
    (schemaConfig: { schema: SettingSchemaMap<string> }) =>
    async ({ actionId }: z.infer<typeof deleteKeybindingSchema>, { db }: { db: AppClient }) => {
        const fullSchemaConfig = applyServerFilter('server_get_settings_schema', schemaConfig);
        const serverConfig = applyServerFilter('server_get_settings_server_config', { providers: {} });

        const settingsModel = new SettingServerModel(async () => db, serverConfig, fullSchemaConfig);

        const settings = await settingsModel.getSettings([KEYBINDINGS_SETTING_NAME]);
        const currentKeybindings = settings.keybindings || {};
        const updatedKeybindings: Record<string, string> = { ...currentKeybindings };
        delete updatedKeybindings[actionId];

        await settingsModel.updateSettings({ [KEYBINDINGS_SETTING_NAME]: updatedKeybindings });

        // Validate response before returning
        return { success: true };
    };
