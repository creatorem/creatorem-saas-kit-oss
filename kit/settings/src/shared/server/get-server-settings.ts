import 'server-only';

import { AppClient } from '@kit/db';
import { getDBClient } from '@kit/supabase-server';
import { applyServerFilter } from '@kit/utils/filters/server';
import { SettingServerModel } from './setting-server-model';
import { ExtractSettingsValues, SettingSchemaMap } from '../type';

export interface ServerSettingsSchemaRegistry {}

type DefaultServerSettingsSchema = keyof ServerSettingsSchemaRegistry extends never
    ? SettingSchemaMap<string>
    : ServerSettingsSchemaRegistry & SettingSchemaMap<string>;

type GetServerSettingsParams<
    TSchema extends SettingSchemaMap<string>,
    TKeys extends readonly Extract<keyof TSchema, string>[],
> = {
    db?: AppClient;
    settingKeys: TKeys;
};

export async function getServerSettings<
    TSchema extends SettingSchemaMap<string> = DefaultServerSettingsSchema,
    const TKeys extends readonly Extract<keyof TSchema, string>[] = readonly Extract<keyof TSchema, string>[],
>({
    db,
    settingKeys,
}: GetServerSettingsParams<TSchema, TKeys>): Promise<Pick<ExtractSettingsValues<TSchema>, TKeys[number]>> {
    const fullSchemaConfig = applyServerFilter('server_get_settings_schema', { schema: {} as TSchema });
    const serverConfig = applyServerFilter('server_get_settings_server_config', { providers: {} });

    if (settingKeys.length === 0) {
        return {} as Pick<ExtractSettingsValues<TSchema>, TKeys[number]>;
    }

    const missingSettingKeys = settingKeys.filter((settingKey) => !(settingKey in fullSchemaConfig.schema));
    if (missingSettingKeys.length > 0) {
        throw new Error(
            `Missing settings schema for keys: ${missingSettingKeys.join(', ')}. Ensure app server filters enqueue the base schema in 'server_get_settings_schema'.`,
        );
    }

    const resolvedDb = db ?? (await getDBClient());
    const settingsModel = new SettingServerModel(async () => resolvedDb, serverConfig, fullSchemaConfig);

    return (await settingsModel.getSettings(settingKeys)) as Pick<ExtractSettingsValues<TSchema>, TKeys[number]>;
}
