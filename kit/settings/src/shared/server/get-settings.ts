import { AppClient } from '@kit/db';
import { applyServerFilter } from '@kit/utils/filters/server';
import { SettingServerModel } from './setting-server-model';
import { ExtractSettingsValues, SettingSchemaMap } from '../type';

type GetSettingsParams<TSchema extends SettingSchemaMap<string>, TKey extends Extract<keyof TSchema, string>> = {
    db: AppClient;
    schemaConfig: { schema: TSchema };
    settingKeys: TKey[];
};

export async function getSettings<
    TSchema extends SettingSchemaMap<string>,
    TKey extends Extract<keyof TSchema, string>,
>({
    db,
    schemaConfig,
    settingKeys,
}: GetSettingsParams<TSchema, TKey>): Promise<Pick<ExtractSettingsValues<TSchema>, TKey>> {
    const fullSchemaConfig = applyServerFilter('server_get_settings_schema', schemaConfig);
    const serverConfig = applyServerFilter('server_get_settings_server_config', { providers: {} });
    const settingsModel = new SettingServerModel(async () => db, serverConfig, fullSchemaConfig);

    if (settingKeys.length === 0) {
        return {} as Pick<ExtractSettingsValues<TSchema>, TKey>;
    }

    return (await settingsModel.getSettings(settingKeys)) as Pick<ExtractSettingsValues<TSchema>, TKey>;
}
