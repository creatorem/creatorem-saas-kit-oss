import { logger } from '@kit/utils';
import Stripe from 'stripe';

/**
 * Create a Stripe checkout session for wallet top-up
 * @param stripe - Stripe client instance
 * @param params - Checkout parameters
 * @returns Checkout URL
 */
export async function createStripeWalletTopUpCheckout(
    stripe: Stripe,
    params: {
        amount: number;
        currency: string;
        userId: string;
        customerEmail?: string;
        customerId?: string;
        successUrl: string;
        cancelUrl: string;
        metadata?: Record<string, string>;
    },
): Promise<{ url: string }> {
    try {
        const wallet = new StripeWallet(stripe);
        const session = await wallet.createTopUpCheckoutSession(params);

        logger.info(
            {
                provider: 'stripe',
                userId: params.userId,
                amount: params.amount,
            },
            'Created Stripe wallet top-up checkout',
        );

        return { url: session.url! };
    } catch (error) {
        logger.error(
            { error, provider: 'stripe', userId: params.userId },
            'Failed to create Stripe wallet top-up checkout',
        );
        throw error;
    }
}

/**
 * Process a Stripe wallet top-up payment from webhook event
 * @param stripe - Stripe client instance
 * @param event - Stripe webhook event
 * @returns Payment details if it's a wallet top-up, null otherwise
 */
export async function processStripeWalletTopUpPayment(
    stripe: Stripe,
    event: Stripe.Event,
): Promise<{
    userId: string;
    amount: number;
    currency: string;
    paymentId: string;
} | null> {
    const wallet = new StripeWallet(stripe);
    return await wallet.processWalletTopUpPayment(event);
}

/**
 * StripeWallet handles Stripe-specific payment operations for wallet top-ups
 * This class should only contain Stripe payment logic, not database operations
 */
export class StripeWallet {
    constructor(private readonly stripe: Stripe) {}

    /**
     * Create a Stripe checkout session for wallet top-up
     * @param params - Checkout session parameters
     * @returns Stripe checkout session
     */
    async createTopUpCheckoutSession(params: {
        amount: number;
        currency: string;
        userId: string;
        customerId?: string;
        customerEmail?: string;
        successUrl: string;
        cancelUrl: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Checkout.Session> {
        try {
            // Amount in cents for Stripe
            const amountInCents = Math.round(params.amount * 100);

            // Customer data
            const customerData = params.customerId
                ? { customer: params.customerId }
                : params.customerEmail
                  ? { customer_email: params.customerEmail }
                  : {};

            const session = await this.stripe.checkout.sessions.create({
                mode: 'payment',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: params.currency.toLowerCase(),
                            product_data: {
                                name: 'AI Wallet Top-Up',
                                description: `Add $${params.amount.toFixed(2)} to your AI wallet`,
                            },
                            unit_amount: amountInCents,
                        },
                        quantity: 1,
                    },
                ],
                success_url: params.successUrl,
                cancel_url: params.cancelUrl,
                client_reference_id: params.userId,
                metadata: {
                    type: 'wallet_topup',
                    userId: params.userId,
                    amount: params.amount.toString(),
                    currency: params.currency,
                    ...params.metadata,
                },
                expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
                ...customerData,
            });

            logger.info(
                {
                    sessionId: session.id,
                    userId: params.userId,
                    amount: params.amount,
                    currency: params.currency,
                },
                'Created wallet top-up checkout session',
            );

            return session;
        } catch (error) {
            logger.error(
                { error, userId: params.userId, amount: params.amount },
                'Failed to create wallet top-up checkout session',
            );
            throw error;
        }
    }

    /**
     * Process wallet top-up payment from Stripe webhook event
     * @param event - Stripe webhook event
     * @returns Payment details if it's a wallet top-up, null otherwise
     */
    async processWalletTopUpPayment(event: Stripe.Event): Promise<{
        userId: string;
        amount: number;
        currency: string;
        paymentId: string;
    } | null> {
        try {
            // Check if this is a checkout.session.completed event
            if (event.type !== 'checkout.session.completed') {
                return null;
            }

            const session = event.data.object as Stripe.Checkout.Session;

            // If metadata is missing, retrieve the full session object
            let fullSession = session;
            if (!session.metadata || !session.metadata.type) {
                logger.info({ sessionId: session.id }, 'Metadata missing from webhook event, retrieving full session');
                fullSession = await this.stripe.checkout.sessions.retrieve(session.id);
            }

            // Check if this is a wallet top-up session
            if (fullSession.metadata?.type !== 'wallet_topup') {
                return null;
            }

            // Extract payment details
            const userId = fullSession.metadata?.userId || fullSession.client_reference_id;
            if (!userId) {
                throw new Error('User ID not found in session metadata');
            }

            const amount = parseFloat(fullSession.metadata?.amount || '0');
            if (amount <= 0) {
                throw new Error('Invalid amount in session metadata');
            }

            const currency = fullSession.metadata?.currency || 'USD';
            const paymentIntentId =
                typeof fullSession.payment_intent === 'string'
                    ? fullSession.payment_intent
                    : fullSession.payment_intent?.id || '';

            logger.info(
                {
                    sessionId: fullSession.id,
                    userId,
                    amount,
                    currency,
                    paymentIntentId,
                },
                'Processing Stripe wallet top-up payment',
            );

            return {
                userId,
                amount,
                currency,
                paymentId: paymentIntentId,
            };
        } catch (error) {
            logger.error({ error, eventId: event.id }, 'Failed to process Stripe wallet top-up payment');
            throw error;
        }
    }

    /**
     * Process refund for wallet deposit
     * @param params - Refund parameters
     * @returns Stripe refund
     */
    async processRefund(params: { paymentIntentId: string; amount?: number; reason?: string }): Promise<Stripe.Refund> {
        try {
            const refundParams: Stripe.RefundCreateParams = {
                payment_intent: params.paymentIntentId,
            };

            if (params.amount) {
                // Amount in cents for Stripe
                refundParams.amount = Math.round(params.amount * 100);
            }

            if (params.reason) {
                refundParams.reason = params.reason as Stripe.RefundCreateParams.Reason;
            }

            const refund = await this.stripe.refunds.create(refundParams);

            logger.info(
                {
                    refundId: refund.id,
                    paymentIntentId: params.paymentIntentId,
                    amount: params.amount,
                },
                'Processed wallet refund',
            );

            return refund;
        } catch (error) {
            logger.error({ error, paymentIntentId: params.paymentIntentId }, 'Failed to process wallet refund');
            throw error;
        }
    }
}
