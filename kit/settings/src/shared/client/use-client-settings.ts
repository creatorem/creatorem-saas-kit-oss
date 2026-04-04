import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { settingsRouter } from '../../router/router';
import type { ExtractSettingsValues, SettingSchemaMap } from '../type';

type SettingsClientTrpc = TrpcClientWithQuery<typeof settingsRouter>;
type SettingsClientUseQueryOptions = Omit<Parameters<SettingsClientTrpc['getSettingsValues']['useQuery']>[0], 'input'>;

type UseClientSettingsParams<TSchema extends SettingSchemaMap<string>, TKey extends Extract<keyof TSchema, string>> = {
    clientTrpc: SettingsClientTrpc;
    settingKeys: TKey[];
} & SettingsClientUseQueryOptions;

type UseClientSettingsResult<TSchema extends SettingSchemaMap<string>, TKey extends Extract<keyof TSchema, string>> = {
    data: Pick<ExtractSettingsValues<TSchema>, TKey> | undefined;
    error: Error | null;
    isPending: boolean;
    isError: boolean;
    isSuccess: boolean;
    status: 'pending' | 'error' | 'success';
    refetch: () => Promise<Pick<ExtractSettingsValues<TSchema>, TKey> | undefined>;
};

export function useClientSettings<
    TSchema extends SettingSchemaMap<string>,
    TKey extends Extract<keyof TSchema, string>,
>({
    clientTrpc,
    settingKeys,
    ...queryOptions
}: UseClientSettingsParams<TSchema, TKey>): UseClientSettingsResult<TSchema, TKey> {
    void queryOptions;

    const keysHash = useMemo(() => {
        const normalized = Array.from(new Set(settingKeys.map((key) => String(key)))).sort();
        return JSON.stringify(normalized);
    }, [settingKeys]);
    const normalizedKeys = useMemo(() => JSON.parse(keysHash) as TKey[], [keysHash]);

    const [data, setData] = useState<Pick<ExtractSettingsValues<TSchema>, TKey> | undefined>(undefined);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const load = useCallback(async () => {
        setIsPending(true);
        setError(null);

        try {
            if (normalizedKeys.length === 0) {
                const empty = {} as Pick<ExtractSettingsValues<TSchema>, TKey>;
                setData(empty);
                return empty;
            }

            const result = (await clientTrpc.getSettingsValues.fetch({
                settingKeys: normalizedKeys,
            })) as Pick<ExtractSettingsValues<TSchema>, TKey>;

            setData(result);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load settings'));
            return undefined;
        } finally {
            setIsPending(false);
        }
    }, [clientTrpc, keysHash, normalizedKeys]);

    useEffect(() => {
        let disposed = false;

        void (async () => {
            setIsPending(true);
            setError(null);

            try {
                if (normalizedKeys.length === 0) {
                    if (!disposed) {
                        setData({} as Pick<ExtractSettingsValues<TSchema>, TKey>);
                    }
                    return;
                }

                const result = (await clientTrpc.getSettingsValues.fetch({
                    settingKeys: normalizedKeys,
                })) as Pick<ExtractSettingsValues<TSchema>, TKey>;

                if (!disposed) {
                    setData(result);
                }
            } catch (err) {
                if (!disposed) {
                    setError(err instanceof Error ? err : new Error('Failed to load settings'));
                }
            } finally {
                if (!disposed) {
                    setIsPending(false);
                }
            }
        })();

        return () => {
            disposed = true;
        };
    }, [clientTrpc, keysHash, normalizedKeys]);

    return {
        data,
        error,
        isPending,
        isError: Boolean(error),
        isSuccess: !isPending && !error,
        status: isPending ? 'pending' : error ? 'error' : 'success',
        refetch: load,
    };
}
