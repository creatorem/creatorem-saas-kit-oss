'use client';

import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import type { BillingConfig } from '@kit/billing-types';
import { useQuery } from '@tanstack/react-query';
import type { billingRouter } from '../router/router';

export function useActiveSubscription(clientTrpc: TrpcClientWithQuery<typeof billingRouter>, config: BillingConfig) {
    const queryKey = ['billing-subscriptions', config];

    const queryFn = async () => {
        return await clientTrpc.getBillingActiveSubscription.fetch({ config });
    };

    return useQuery({
        queryKey,
        queryFn,
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        refetchOnWindowFocus: false,
    });
}
