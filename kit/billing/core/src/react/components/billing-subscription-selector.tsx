'use client';

import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { BillingConfig, BillingList, BillingProduct } from '@kit/billing-types';
import { applyFilter } from '@kit/utils/filters';
import { useState, useTransition } from 'react';
import type { billingRouter } from '../../router/router';
import { EmbeddedCheckout } from '../components/embedded-checkout';
import { DashboardPlanForm } from './dashboard-plan-form';

export function BillingSubscriptionSelector({
    config,
    products,
    clientTrpc,
}: {
    config: BillingConfig;
    products: BillingList<BillingProduct>;
    clientTrpc: TrpcClientWithQuery<typeof billingRouter>;
}) {
    const [pending, startTransition] = useTransition();

    const [checkoutSession, setCheckoutSession] = useState<
        Awaited<ReturnType<typeof clientTrpc.createCheckoutSession.fetch>> | undefined
    >(undefined);

    // If the checkout token is set, render the embedded checkout component
    if (checkoutSession) {
        if (config.checkoutUI === 'embedded') {
            if (!checkoutSession.checkoutToken) {
                throw new Error('Checkout token is not set');
            }
            return (
                <EmbeddedCheckout
                    checkoutToken={checkoutSession.checkoutToken}
                    provider={config.provider}
                    onClose={() => setCheckoutSession(undefined)}
                />
            );
        } else {
            if (!checkoutSession.hostedUrl) {
                throw new Error('Hosted URL is not set');
            }
            window.location.href = checkoutSession.hostedUrl;
        }
    }

    // Otherwise, render the plan picker component
    return (
        <DashboardPlanForm
            config={config}
            products={products}
            onSubmit={({ priceId, productId }) => {
                startTransition(async () => {
                    applyFilter('checkout_started', null, {
                        priceId,
                        productId,
                    });

                    const result = await clientTrpc.createCheckoutSession.fetch({
                        config,
                        priceId,
                        productId,
                        returnUrl: window.location.href,
                    });

                    if (result) {
                        setCheckoutSession(result);
                    }
                });
            }}
        />
    );
}
