import 'server-only';

import type { BillingConfig } from '@kit/billing-types';
import { logger } from '@kit/utils';

/**
 * Create a wallet top-up checkout session
 * Delegates to provider-specific implementations
 */
export async function createWalletTopUpCheckout(
    config: BillingConfig,
    params: {
        amount: number;
        currency: string;
        userId: string;
        customerEmail?: string;
        customerId?: string;
        variantId?: string;
        successUrl: string;
        cancelUrl: string;
        metadata?: Record<string, string>;
    },
): Promise<{ url: string }> {
    try {
        if (config.provider === 'stripe') {
            const { createStripeWalletTopUpCheckout, createStripeClient } = await import('@kit/stripe');
            const stripe = await createStripeClient();

            return await createStripeWalletTopUpCheckout(stripe, params);
        }

        if (config.provider === 'lemon-squeezy') {
            const { createLemonSqueezyWalletTopUpCheckout } = await import('@kit/lemon-squeezy');

            if (!params.variantId) {
                throw new Error(
                    'Lemon Squeezy requires a variant ID. Please create products in Lemon Squeezy dashboard for wallet amounts.',
                );
            }

            return await createLemonSqueezyWalletTopUpCheckout({
                ...params,
                variantId: params.variantId,
            });
        }

        throw new Error(`Unsupported billing provider for wallet: ${config.provider}`);
    } catch (error) {
        logger.error(
            { error, provider: config.provider, userId: params.userId },
            'Failed to create wallet top-up checkout',
        );
        throw error;
    }
}

/**
 * Process a wallet top-up payment from webhook
 * Delegates to provider-specific implementations for proper typing
 */
export async function processWalletTopUpPayment(
    config: BillingConfig,
    event: any,
): Promise<{
    userId: string;
    amount: number;
    currency: string;
    paymentId: string;
} | null> {
    try {
        if (config.provider === 'stripe') {
            const { processStripeWalletTopUpPayment, createStripeClient } = await import('@kit/stripe');
            const stripe = await createStripeClient();

            return await processStripeWalletTopUpPayment(stripe, event);
        }

        if (config.provider === 'lemon-squeezy') {
            const { processLemonSqueezyWalletTopUpPayment } = await import('@kit/lemon-squeezy');

            return await processLemonSqueezyWalletTopUpPayment(event);
        }

        throw new Error(`Unsupported billing provider for wallet: ${config.provider}`);
    } catch (error) {
        logger.error({ error, provider: config.provider }, 'Failed to process wallet top-up payment');
        throw error;
    }
}
