import { AppClient } from '@kit/db';
import { applyServerFilter } from '@kit/utils/filters/server';
import z from 'zod';
import { SettingServerModel } from '../shared/server/setting-server-model';
import { SettingSchemaMap } from '../shared/type';

export const getSettingsValuesSchema = z.object({
    settingKeys: z.array(z.string()),
});

// this trpc endpoint will only work client side because it requires the headersList.get('x-organization-slug'); header to be set.
export const getSettingsValuesAction =
    (schemaConfig: { schema: SettingSchemaMap<string> }) =>
    async ({ settingKeys }: z.infer<typeof getSettingsValuesSchema>, { db }: { db: AppClient }) => {
        const fullSchemaConfig = applyServerFilter('server_get_settings_schema', schemaConfig);
        const serverConfig = applyServerFilter('server_get_settings_server_config', { providers: {} });
        try {
            // Create a SettingServerModel instance using the shared configuration
            const model = new SettingServerModel(async () => db, serverConfig, fullSchemaConfig);

            // Fetch all settings in a single optimized call
            return settingKeys.length > 0 ? await model.getSettings(settingKeys) : {};
        } catch (error) {
            console.error('Error getting settings:', error);
            throw new Error(`Error getting settings ${settingKeys.join(', ')}`);
        }
    };
