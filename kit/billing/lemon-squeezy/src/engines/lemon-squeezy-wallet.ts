import { envs } from '@kit/lemon-squeezy/envs';
import { logger } from '@kit/utils';
import { createCheckout, type NewCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import type { OrderWebhook } from '../types/order-webhook';
import { initializeLemonSqueezyClient } from './lemon-squeezy-client';

/**
 * Extended OrderWebhook type that includes custom data for wallet top-ups
 */
export type WalletOrderWebhook = OrderWebhook & {
    data: OrderWebhook['data'] & {
        attributes: OrderWebhook['data']['attributes'] & {
            custom?: {
                type?: string;
                userId?: string;
                amount?: string;
                currency?: string;
                [key: string]: any;
            };
        };
    };
};

/**
 * Create a Lemon Squeezy checkout session for wallet top-up
 * @param params - Checkout parameters
 * @returns Checkout URL
 */
export async function createLemonSqueezyWalletTopUpCheckout(params: {
    amount: number;
    currency: string;
    userId: string;
    variantId: string;
    customerEmail?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
}): Promise<{ url: string }> {
    try {
        if (!params.variantId) {
            throw new Error(
                'Lemon Squeezy requires a variant ID. Please create products in Lemon Squeezy dashboard for wallet amounts.',
            );
        }

        const wallet = new LemonSqueezyWallet();
        const result = await wallet.createTopUpCheckoutSession(params);

        logger.info(
            {
                provider: 'lemon-squeezy',
                userId: params.userId,
                amount: params.amount,
            },
            'Created Lemon Squeezy wallet top-up checkout',
        );

        return { url: result.url };
    } catch (error) {
        logger.error(
            { error, provider: 'lemon-squeezy', userId: params.userId },
            'Failed to create Lemon Squeezy wallet top-up checkout',
        );
        throw error;
    }
}

/**
 * Process a Lemon Squeezy wallet top-up payment from webhook event
 * @param event - Lemon Squeezy webhook event (OrderWebhook)
 * @returns Payment details if it's a wallet top-up, null otherwise
 */
export async function processLemonSqueezyWalletTopUpPayment(event: WalletOrderWebhook): Promise<{
    userId: string;
    amount: number;
    currency: string;
    paymentId: string;
} | null> {
    const wallet = new LemonSqueezyWallet();
    return await wallet.processWalletTopUpPayment(event);
}

/**
 * LemonSqueezyWallet handles Lemon Squeezy-specific payment operations for wallet top-ups
 * This class should only contain Lemon Squeezy payment logic, not database operations
 */
export class LemonSqueezyWallet {
    /**
     * Create a Lemon Squeezy checkout for wallet top-up
     * Note: Lemon Squeezy doesn't support dynamic pricing like Stripe.
     * You need to create products/variants in Lemon Squeezy dashboard for each amount.
     * @param params - Checkout parameters
     * @returns Lemon Squeezy checkout
     */
    async createTopUpCheckoutSession(params: {
        amount: number;
        currency: string;
        userId: string;
        variantId: string; // Lemon Squeezy variant ID for this amount
        customerEmail?: string;
        successUrl: string;
        cancelUrl: string;
        metadata?: Record<string, string>;
    }): Promise<{ url: string; checkoutId: string }> {
        try {
            await initializeLemonSqueezyClient();

            const storeId = Number(envs().LEMON_SQUEEZY_STORE_ID);
            const variantId = Number(params.variantId);

            const newCheckout: NewCheckout = {
                checkoutOptions: {
                    embed: false,
                    media: true,
                    logo: true,
                    discount: false,
                },
                checkoutData: {
                    email: params.customerEmail,
                    custom: {
                        type: 'wallet_topup',
                        userId: params.userId,
                        amount: params.amount.toString(),
                        currency: params.currency,
                        ...params.metadata,
                    },
                },
                productOptions: {
                    redirectUrl: params.successUrl,
                    enabledVariants: [variantId],
                },
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                preview: false,
                testMode: process.env.NODE_ENV !== 'production',
            };

            const checkout = await createCheckout(storeId, variantId, newCheckout);

            if (!checkout.data?.data.attributes.url) {
                throw new Error('Failed to create checkout URL');
            }

            logger.info(
                {
                    checkoutId: checkout.data.data.id,
                    userId: params.userId,
                    amount: params.amount,
                    currency: params.currency,
                },
                'Created Lemon Squeezy wallet top-up checkout',
            );

            return {
                url: checkout.data.data.attributes.url,
                checkoutId: checkout.data.data.id,
            };
        } catch (error) {
            logger.error(
                { error, userId: params.userId, amount: params.amount },
                'Failed to create Lemon Squeezy wallet top-up checkout',
            );
            throw error;
        }
    }

    /**
     * Process wallet top-up payment from Lemon Squeezy webhook event
     * @param event - Lemon Squeezy webhook event (OrderWebhook)
     * @returns Payment details if it's a wallet top-up, null otherwise
     */
    async processWalletTopUpPayment(event: WalletOrderWebhook): Promise<{
        userId: string;
        amount: number;
        currency: string;
        paymentId: string;
    } | null> {
        try {
            // Check if this is an order_created event
            if (event.meta?.event_name !== 'order_created') {
                return null;
            }

            // Check if this has custom data indicating wallet top-up
            const customData = event.data?.attributes?.custom;
            if (!customData || customData.type !== 'wallet_topup') {
                return null;
            }

            // Extract payment details
            const userId = customData.userId;
            if (!userId) {
                throw new Error('User ID not found in order custom data');
            }

            const amount = parseFloat(customData.amount || '0');
            if (amount <= 0) {
                throw new Error('Invalid amount in order custom data');
            }

            const currency = customData.currency || 'USD';
            const orderId = event.data.id;

            logger.info(
                {
                    orderId,
                    userId,
                    amount,
                    currency,
                },
                'Processing Lemon Squeezy wallet top-up payment',
            );

            return {
                userId,
                amount,
                currency,
                paymentId: orderId,
            };
        } catch (error) {
            logger.error({ error, eventId: event.data?.id }, 'Failed to process Lemon Squeezy wallet top-up payment');
            throw error;
        }
    }

    /**
     * Process refund for wallet deposit
     * Note: Lemon Squeezy refunds are handled manually through the dashboard
     * or via API using the order ID
     * @param params - Refund parameters
     * @returns Refund confirmation
     */
    async processRefund(params: {
        orderId: string;
        amount?: number;
        reason?: string;
    }): Promise<{ refundId: string; status: string }> {
        try {
            // Lemon Squeezy doesn't have a direct refund API in the SDK yet
            // Refunds need to be processed manually through the dashboard
            // or using the REST API directly

            logger.warn(
                {
                    orderId: params.orderId,
                    amount: params.amount,
                    reason: params.reason,
                },
                'Lemon Squeezy wallet refund requested - process manually in dashboard',
            );

            // For now, return a pending status
            return {
                refundId: params.orderId,
                status: 'pending_manual_processing',
            };
        } catch (error) {
            logger.error({ error, orderId: params.orderId }, 'Failed to process Lemon Squeezy wallet refund');
            throw error;
        }
    }
}
