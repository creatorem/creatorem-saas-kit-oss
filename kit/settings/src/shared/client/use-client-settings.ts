import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import type { settingsRouter } from '../../router/router';
import type { ExtractSettingsValues, SettingSchemaMap } from '../type';

type SettingsClientTrpc = TrpcClientWithQuery<typeof settingsRouter>;
type SettingsClientUseQueryOptions = Omit<Parameters<SettingsClientTrpc['getSettingsValues']['useQuery']>[0], 'input'>;

type UseClientSettingsParams<TSchema extends SettingSchemaMap<string>, TKey extends Extract<keyof TSchema, string>> = {
    clientTrpc: SettingsClientTrpc;
    settingKeys: TKey[];
} & SettingsClientUseQueryOptions;

export function useClientSettings<
    TSchema extends SettingSchemaMap<string>,
    TKey extends Extract<keyof TSchema, string>,
>({ clientTrpc, settingKeys, ...queryOptions }: UseClientSettingsParams<TSchema, TKey>) {
    const query = clientTrpc.getSettingsValues.useQuery({
        input: {
            settingKeys,
        },
        ...queryOptions,
    });

    return query as typeof query & {
        data: Pick<ExtractSettingsValues<TSchema>, TKey> | undefined;
    };
}
