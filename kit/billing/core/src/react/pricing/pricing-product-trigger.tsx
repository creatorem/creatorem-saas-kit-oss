'use client';

import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Button } from '@kit/ui/button';
import { useMutation } from '@tanstack/react-query';
import React, { ReactNode, useCallback, useState } from 'react';
// import { createCheckoutSession } from '../../actions/create-checkout-session';
import type { billingRouter } from '../../router/router';
import { EmbeddedCheckout } from '../components/embedded-checkout';
import { usePricing, useProduct } from './pricing';

interface PricingProductTriggerProps {
    returnUrl?: string;
    children: ReactNode;
    className?: string;
    /**
     * Optional tRPC client for authenticated contexts.
     * If not provided, will use the action directly (for public pricing pages).
     */
    clientTrpc: TrpcClientWithQuery<typeof billingRouter>;
}
/**
 * This component creates checkout sessions.
 * In authenticated contexts, pass clientTrpc for type-safe API calls.
 * In public contexts (marketing site), it will use the action directly.
 */
export const PricingProductTrigger: React.FC<PricingProductTriggerProps> = ({
    children,
    returnUrl,
    className,
    clientTrpc,
}) => {
    const { config } = usePricing();
    const { product, price, hasFreeTrial } = useProduct();
    const [checkoutSession, setCheckoutSession] = useState<
        Awaited<ReturnType<TrpcClientWithQuery<typeof billingRouter>['createCheckoutSession']['fetch']>> | undefined
    >(undefined);

    const mutation = useMutation({
        mutationFn: async () =>
            await clientTrpc.createCheckoutSession.fetch({
                config,
                priceId: price.id,
                productId: product.id,
                returnUrl: returnUrl ?? window.location.href,
            }),
        onSuccess: (result) => {
            if (result) {
                setCheckoutSession(result);
            }
        },
    });

    const handleClick = useCallback(() => {
        mutation.mutate();
    }, [mutation]);

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

    return (
        <Button
            data-popular={Boolean(product.popular)}
            aria-label={
                hasFreeTrial
                    ? `Start a free trial on the ${product.name} plan`
                    : `Subscribe to the ${product.name} plan`
            }
            className={className}
            loading={mutation.isPending}
            onClick={handleClick}
        >
            {children}
        </Button>
    );
};
