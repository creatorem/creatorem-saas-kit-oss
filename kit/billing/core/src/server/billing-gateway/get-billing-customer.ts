import 'server-only';

import { AbstractBillingCustomer, BillingConfig } from '@kit/billing-types';

export const getBillingCustomer = async (
    config: BillingConfig,
    customerId: string,
): Promise<AbstractBillingCustomer> => {
    switch (config.provider) {
        case 'stripe': {
            const { StripeBillingCustomer } = await import('@kit/stripe');
            return new StripeBillingCustomer(customerId);
        }
        case 'lemon-squeezy': {
            const { LemonSqueezyBillingCustomer } = await import('@kit/lemon-squeezy');
            return new LemonSqueezyBillingCustomer(customerId);
        }
    }
};
