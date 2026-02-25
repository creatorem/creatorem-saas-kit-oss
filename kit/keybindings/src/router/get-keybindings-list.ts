import { AppClient } from '@kit/db';
import { SettingSchemaMap } from '@kit/settings/shared';
import { SettingServerModel } from '@kit/settings/shared/server/setting-server-model';
import { applyServerFilter } from '@kit/utils/filters/server';
import { z } from 'zod';
import { KEYBINDINGS_SETTING_NAME } from '../storage/settings-storage/settings';

const getKeybindingsResponseSchema = z.object({
    keybindings: z.array(
        z.object({
            actionId: z.string(),
            shortcut: z.string(),
        }),
    ),
});

export const getKeybindingsListAction =
    (schemaConfig: { schema: SettingSchemaMap<string> }) =>
    async ({ db }: { db: AppClient }) => {
        const fullSchemaConfig = applyServerFilter('server_get_settings_schema', schemaConfig);
        const serverConfig = applyServerFilter('server_get_settings_server_config', { providers: {} });

        const settingsModel = new SettingServerModel(async () => db, serverConfig, fullSchemaConfig);

        const { keybindings } = await settingsModel.getSettings([KEYBINDINGS_SETTING_NAME]);
        const keybindingsArray = Object.entries(keybindings || {}).map(([actionId, shortcut]) => ({
            actionId,
            shortcut: shortcut as string,
        }));

        return getKeybindingsResponseSchema.parse({ keybindings: keybindingsArray });
    };
