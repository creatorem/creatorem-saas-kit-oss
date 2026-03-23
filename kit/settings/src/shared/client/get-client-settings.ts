import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import type { settingsRouter } from '../../router/router';
import type { ExtractSettingsValues, SettingSchemaMap } from '../type';

type SettingsClientTrpc = TrpcClientWithQuery<typeof settingsRouter>;

type GetClientSettingsParams<TSchema extends SettingSchemaMap<string>, TKey extends Extract<keyof TSchema, string>> = {
    clientTrpc: SettingsClientTrpc;
    settingKeys: TKey[];
};

export async function getClientSettings<
    TSchema extends SettingSchemaMap<string>,
    TKey extends Extract<keyof TSchema, string>,
>({
    clientTrpc,
    settingKeys,
}: GetClientSettingsParams<TSchema, TKey>): Promise<Pick<ExtractSettingsValues<TSchema>, TKey>> {
    if (settingKeys.length === 0) {
        return {} as Pick<ExtractSettingsValues<TSchema>, TKey>;
    }

    return (await clientTrpc.getSettingsValues.fetch({
        settingKeys,
    })) as Pick<ExtractSettingsValues<TSchema>, TKey>;
}
