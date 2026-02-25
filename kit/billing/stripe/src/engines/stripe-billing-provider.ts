import 'server-only';

import { AbstractBillingProvider, BillingConfig, PaymentType, productSchema } from '@kit/billing-types';
import type {
    cancelSubscriptionParamsSchema,
    createCheckoutSessionSchema,
    createCustomerParamsSchema,
    retrieveCheckoutSessionSchema,
    updateSubscriptionItemParamsSchema,
} from '@kit/billing-types/schema';
import { logger } from '@kit/utils';
import type { Stripe } from 'stripe';
import { z } from 'zod';
import { createStripeCheckout } from './create-stripe-checkout';
import { createStripeClient } from './stripe-server';
import { createStripeSubscriptionPayloadBuilderEngine } from './stripe-subscription-payload-builder';

export class StripeBillingProvider implements AbstractBillingProvider {
    private readonly namespace = 'billing.stripe';
    public config: BillingConfig;

    constructor(config: BillingConfig) {
        this.config = config;
    }

    /**
     * Example of a stripe price object:
     * {
     *     "id": "price_1Rrz4pFoH9EGCXA37FLUn9eN",
     *     "object": "price",
     *     "active": true,
     *     "billing_scheme": "per_unit",
     *     "created": 1754216619,
     *     "currency": "eur",
     *     "custom_unit_amount": null,
     *     "livemode": false,
     *     "lookup_key": null,
     *     "metadata": {},
     *     "nickname": null,
     *     "product": "prod_SnZo9gjf64pu8V",
     *     "recurring": {
     *         "interval": "month",
     *         "interval_count": 1,
     *         "meter": null,
     *         "trial_period_days": null,
     *         "usage_type": "licensed"
     *     },
     *     "tax_behavior": "unspecified",
     *     "tiers_mode": null,
     *     "transform_quantity": null,
     *     "type": "recurring",
     *     "unit_amount": 900,
     *     "unit_amount_decimal": "900"
     * }
     */
    async fetchProducts() {
        const stripe = await this.stripeProvider();

        const stripeProducts = await stripe.products.list({
            ids: this.config.products.map((product) => product.id),
        });

        return {
            data: await Promise.all(
                (stripeProducts.data as Stripe.Product[]).map(async (product) => {
                    const prices = await stripe.prices.list({
                        product: product.id,
                    });

                    const configProduct = this.config.products.find((p) => p.id === product.id);
                    if (!configProduct) throw new Error(`Product ${product.id} not found in config`);

                    return productSchema.parse({
                        active: product.active,
                        name: product.name ?? '',
                        description: product.description ?? '',
                        imageUrl: product.images?.[0] ?? null,
                        prices: prices.data.map((price) => ({
                            id: price.id,
                            currency: price.currency,
                            billingScheme: price.billing_scheme,
                            amount: price.unit_amount ?? NaN,
                            type: price.type,
                            recurring: {
                                interval: price.recurring?.interval ?? null,
                                trialPeriodDays: price.recurring?.trial_period_days ?? null,
                            },
                        })),
                        ...configProduct,
                    });
                }),
            ),
            hasMore: stripeProducts.has_more,
        };
    }

    async createCustomer(params: z.infer<typeof createCustomerParamsSchema>) {
        const stripe = await this.stripeProvider();

        const stripeCustomer = await stripe.customers.create(params);

        return {
            customerId: stripeCustomer.id,
        };
    }

    async createCheckoutSession(params: z.infer<typeof createCheckoutSessionSchema>) {
        const stripe = await this.stripeProvider();

        const ctx = {
            namespace: this.namespace,
            customerId: params.customerId,
            attachedEntityId: params.attachedEntityId,
        };

        logger.info(ctx, 'Creating checkout session...');

        const createdCheckout = await createStripeCheckout(stripe, params);

        if (params.config.checkoutUI === 'embedded' && !createdCheckout.client_secret) {
            logger.error(ctx, 'Failed to create checkout "embedded" session');

            throw new Error('Failed to create checkout "embedded" session');
        }

        logger.info(ctx, 'Checkout session created successfully');

        const hostedUrl = createdCheckout.url;
        if (params.config.checkoutUI === 'hosted' && !hostedUrl) {
            logger.error(ctx, 'Failed to create checkout "hosted" session');
            throw new Error('Failed to create checkout "hosted" session');
        }

        return {
            checkoutToken: createdCheckout.client_secret,
            hostedUrl: hostedUrl,
        };
    }

    async cancelSubscription(params: z.infer<typeof cancelSubscriptionParamsSchema>) {
        const stripe = await this.stripeProvider();

        const ctx = {
            namespace: this.namespace,
            subscriptionId: params.subscriptionId,
        };

        logger.info(ctx, 'Cancelling subscription...');

        try {
            await stripe.subscriptions.cancel(params.subscriptionId, {
                invoice_now: params.invoiceNow ?? true,
            });

            logger.info(ctx, 'Subscription cancelled successfully');

            return {
                success: true,
            };
        } catch (error) {
            logger.info(
                {
                    ...ctx,
                    error,
                },
                `Failed to cancel subscription. It may have already been cancelled on the user's end.`,
            );

            return {
                success: false,
            };
        }
    }

    async retrieveCheckoutSession(params: z.infer<typeof retrieveCheckoutSessionSchema>) {
        const stripe = await this.stripeProvider();

        const ctx = {
            namespace: this.namespace,
            sessionId: params.sessionId,
        };

        logger.info(ctx, 'Retrieving checkout session...');

        try {
            const session = await stripe.checkout.sessions.retrieve(params.sessionId);
            const sessionOpen = session.status === 'open';

            logger.info(ctx, 'Checkout session retrieved successfully');

            return {
                checkoutToken: session.client_secret,
                sessionOpen,
                status: session.status ?? 'complete',
                customer: {
                    email: session.customer_details?.email ?? null,
                },
                created: new Date(session.created * 1000).toISOString(),
                hasExpired:
                    session.status === 'expired' ||
                    (session.expires_at ? session.expires_at < Math.floor(Date.now() / 1000) : false),
                raw: session,
            };
        } catch (error) {
            logger.error(
                {
                    ...ctx,
                    error,
                },
                'Failed to retrieve checkout session',
            );

            throw new Error('Failed to retrieve checkout session');
        }
    }

    async updateSubscriptionItem(params: z.infer<typeof updateSubscriptionItemParamsSchema>) {
        const stripe = await this.stripeProvider();

        const ctx = {
            namespace: this.namespace,
            subscriptionId: params.subscriptionId,
            subscriptionItemId: params.subscriptionItemId,
            quantity: params.quantity,
        };

        logger.info(ctx, 'Updating subscription...');

        try {
            await stripe.subscriptions.update(params.subscriptionId, {
                items: [
                    {
                        id: params.subscriptionItemId,
                        quantity: params.quantity,
                    },
                ],
            });

            logger.info(ctx, 'Subscription updated successfully');

            return { success: true };
        } catch (error) {
            logger.error({ ...ctx, error }, 'Failed to update subscription');

            throw new Error('Failed to update subscription');
        }
    }

    async getPlanById(priceId: string) {
        const ctx = {
            namespace: this.namespace,
            priceId,
        };

        logger.info(ctx, 'Retrieving plan by id...');

        const stripe = await this.stripeProvider();

        try {
            const price = await stripe.prices.retrieve(priceId, {
                expand: ['product'],
            });

            logger.info(ctx, 'Plan retrieved successfully');

            return {
                id: price.id,
                name: (price.product as Stripe.Product).name,
                description: (price.product as Stripe.Product).description || '',
                amount: price.unit_amount ? price.unit_amount / 100 : 0,
                type: (price.type === 'recurring' ? 'subscription' : 'one-time') as PaymentType,
                interval: price.recurring?.interval ?? 'month',
                intervalCount: price.recurring?.interval_count,
            };
        } catch (error) {
            logger.error({ ...ctx, error }, 'Failed to retrieve plan');

            throw new Error('Failed to retrieve plan');
        }
    }

    async getSubscription(subscriptionId: string) {
        const stripe = await this.stripeProvider();

        const ctx = {
            namespace: this.namespace,
            subscriptionId,
        };

        logger.info(ctx, 'Retrieving subscription...');

        const subscriptionPayloadBuilder = createStripeSubscriptionPayloadBuilderEngine();

        try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);

            logger.info(ctx, 'Subscription retrieved successfully');

            const customer = subscription.customer as string;
            const accountId = subscription.metadata?.accountId as string;

            const periodStartsAt = subscriptionPayloadBuilder.getPeriodStartsAt(subscription);

            const periodEndsAt = subscriptionPayloadBuilder.getPeriodEndsAt(subscription);

            const lineItems = subscription.items.data.map((item) => {
                return {
                    ...item,
                    type: '' as never,
                };
            });

            return subscriptionPayloadBuilder.build({
                customer_details: null,
                customerId: customer,
                accountId,
                id: subscription.id,
                lineItems,
                status: subscription.status,
                currency: subscription.currency,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                periodStartsAt,
                periodEndsAt,
                trialStartsAt: subscription.trial_start,
                trialEndsAt: subscription.trial_end,
            });
        } catch (error) {
            logger.error({ ...ctx, error }, 'Failed to retrieve subscription');

            throw new Error('Failed to retrieve subscription');
        }
    }

    private async stripeProvider(): Promise<Stripe> {
        return createStripeClient();
    }
}
