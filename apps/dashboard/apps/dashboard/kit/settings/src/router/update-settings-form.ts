import { AppClient } from '@kit/db';
import { applyServerFilter } from '@kit/utils/filters/server';
import z from 'zod';
import { SettingServerModel } from '../shared/server/setting-server-model';
import { SettingSchemaMap } from '../shared/type';

export const updateSettingsFormSchema = z.object({
    values: z.record(z.string(), z.any()),
    settingKeys: z.array(z.string()),
});

export const updateSettingsFormAction =
    (schemaConfig: { schema: SettingSchemaMap<string> }) =>
    async ({ settingKeys, values }: z.infer<typeof updateSettingsFormSchema>, { db }: { db: AppClient }) => {
        const fullSchemaConfig = applyServerFilter('server_get_settings_schema', schemaConfig);
        const serverConfig = applyServerFilter('server_get_settings_server_config', { providers: {} });
        const model = new SettingServerModel(async () => db, serverConfig, fullSchemaConfig);

        // Filter values to only include persisted settings (exclude logic inputs)
        const persistedValues: Record<string, any> = {};
        for (const [key, value] of Object.entries(values)) {
            if (settingKeys.includes(key)) {
                persistedValues[key] = value;
            }
        }

        // Only update the persisted settings
        if (Object.keys(persistedValues).length > 0) {
            await model.updateSettings(persistedValues);
        }
    };
