'use server';

import { BillingConfig } from '@kit/billing-types';
import React from 'react';
import { getBillingProvider } from '../../server/billing-gateway/get-billing-provider';
import { PricingRoot } from './pricing';
import { RecurringPricingImplClient } from './recurring-pricing-impl-client';

interface RecurringPricingImplProps {
    config: BillingConfig;
}

export const RecurringPricingImpl: React.FC<RecurringPricingImplProps> = async ({ config }) => {
    const provider = await getBillingProvider(config);
    const products = await provider.fetchProducts();

    return <RecurringPricingImplClient products={products} config={config} />;
};

export const fetchProducts = async (config: BillingConfig) => {
    const provider = await getBillingProvider(config);
    const products = await provider.fetchProducts();
    return products;
};

export const PricingRootServer: React.FC<RecurringPricingImplProps & { children: React.ReactNode }> = async ({
    config,
    children,
}) => {
    const products = await fetchProducts(config);
    return (
        <PricingRoot products={products} config={config}>
            {children}
        </PricingRoot>
    );
};
