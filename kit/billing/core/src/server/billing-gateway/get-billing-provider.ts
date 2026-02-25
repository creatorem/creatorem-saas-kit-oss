import 'server-only';

import { AbstractBillingProvider, BillingConfig } from '@kit/billing-types';

export const getBillingProvider = async (config: BillingConfig): Promise<AbstractBillingProvider> => {
    switch (config.provider) {
        case 'stripe': {
            const { StripeBillingProvider } = await import('@kit/stripe');
            return new StripeBillingProvider(config);
        }
        case 'lemon-squeezy': {
            const { LemonSqueezyBillingProvider } = await import('@kit/lemon-squeezy');
            return new LemonSqueezyBillingProvider(config);
        }
    }
};
