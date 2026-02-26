'use client';

import { createTrpcQueryClient, type TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import type { AppRouter } from '@kit/shared/types/router';
import { getSupabaseClient } from '@kit/supabase-client';
import { logger } from '@kit/utils';
import { useApplyFilter } from '@kit/utils/filters';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useContext, useMemo } from 'react';

type TrpcClientContextType = {
    clientTrpc: TrpcClientWithQuery<AppRouter>;
};

const TrpcClientContext = React.createContext<TrpcClientContextType>({
    clientTrpc: {} as TrpcClientWithQuery<AppRouter>,
});

export const useCtxTrpc = (): TrpcClientContextType => {
    const client = useContext(TrpcClientContext);

    if (!client) {
        throw new Error('clientTrpc not found, requires provider.');
    }

    return client;
};

export const TrpcClientProvider = ({ children, url }: { children: React.ReactNode; url: string }) => {
    const trpcHeaders = useApplyFilter('get_trpc_headers', {});

    const getHeaders = useCallback(async () => {
        const supabase = getSupabaseClient();
        const jwt = (await supabase.auth.getSession()).data.session?.access_token;
        // console.warn('get headers')
        // const trpcHeaders = applyFilter('get_trpc_headers', {})
        if (!jwt) {
            logger.warn({ trpcHeaders }, 'No jwt found getting headers for the trpc client.');
            return trpcHeaders;
        }

        const headers = {
            ...trpcHeaders,
            Authorization: `Bearer ${jwt!}`,
        };

        logger.info({ headers }, 'Headers added to the trpc client.');

        return headers;
    }, [trpcHeaders]);
    // }, [])

    const clientTrpc = useMemo(
        () =>
            createTrpcQueryClient<AppRouter>({
                url,
                headers: getHeaders,
                useQuery,
            }),
        [getHeaders],
    );

    return <TrpcClientContext.Provider value={{ clientTrpc }}>{children}</TrpcClientContext.Provider>;
};
