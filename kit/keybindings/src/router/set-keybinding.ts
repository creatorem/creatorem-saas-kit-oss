import { AppClient } from '@kit/db';
import { SettingSchemaMap } from '@kit/settings/shared';
import { SettingServerModel } from '@kit/settings/shared/server/setting-server-model';
import { applyServerFilter } from '@kit/utils/filters/server';
import z from 'zod';
import { KEYBINDINGS_SETTING_NAME } from '../storage/settings-storage/settings';

export const setKeybindingSchema = z.object({
    actionId: z.string(),
    shortcut: z.string(),
});

export const setKeybindingAction =
    (schemaConfig: { schema: SettingSchemaMap<string> }) =>
    async ({ actionId, shortcut }: z.infer<typeof setKeybindingSchema>, { db }: { db: AppClient }) => {
        const fullSchemaConfig = applyServerFilter('server_get_settings_schema', schemaConfig);
        const serverConfig = applyServerFilter('server_get_settings_server_config', { providers: {} });

        const settingsModel = new SettingServerModel(async () => db, serverConfig, fullSchemaConfig);

        const settings = await settingsModel.getSettings([KEYBINDINGS_SETTING_NAME]);
        const currentKeybindings = settings.keybindings || {};
        const updatedKeybindings = { ...currentKeybindings, [actionId]: shortcut };

        await settingsModel.updateSettings({ keybindings: updatedKeybindings });

        // Validate response before returning
        return { success: true };
    };
