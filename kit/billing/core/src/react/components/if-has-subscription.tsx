'use client';

import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { BillingConfig } from '@kit/billing-types';
import React from 'react';
import type { billingRouter } from '../../router/router';
import { useActiveSubscription } from '../use-active-subscription';

interface IfHasSubscriptionProps {
    config: BillingConfig;
    children: React.ReactNode;
    /**
     * If true, the component will render the children if the user does NOT have a subscription
     * @default false
     */
    fallback?: boolean;
    clientTrpc: TrpcClientWithQuery<typeof billingRouter>;
}

export function IfHasSubscription({ config, children, fallback = false, clientTrpc }: IfHasSubscriptionProps) {
    const { data: subscription, isLoading } = useActiveSubscription(clientTrpc, config);

    // Don't render anything while loading
    if (isLoading) {
        return null;
    }

    const hasSubscription = subscription !== null;

    if (hasSubscription) {
        if (!fallback) {
            return <>{children}</>;
        }
    } else if (fallback) {
        return <>{children}</>;
    }

    return null;
}
