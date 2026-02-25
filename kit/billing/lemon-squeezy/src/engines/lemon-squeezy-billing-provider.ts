import 'server-only';

import { AbstractBillingProvider, BillingConfig, productSchema } from '@kit/billing-types';
import type {
    cancelSubscriptionParamsSchema,
    createCheckoutSessionSchema,
    createCustomerParamsSchema,
    retrieveCheckoutSessionSchema,
    updateSubscriptionItemParamsSchema,
} from '@kit/billing-types/schema';
import { envs } from '@kit/lemon-squeezy/envs';
import { logger } from '@kit/utils';
import {
    cancelSubscription,
    createCustomer as createLemonSqueezyCustomer,
    getCheckout,
    getStore,
    getSubscription,
    getVariant,
    listCustomers,
    listProducts,
    listVariants,
    updateSubscriptionItem,
} from '@lemonsqueezy/lemonsqueezy.js';
import { z } from 'zod';
import { createLemonSqueezyCheckout } from './create-lemon-squeezy-checkout';
import { initializeLemonSqueezyClient } from './lemon-squeezy-client';
import { createLemonSqueezySubscriptionPayloadBuilderEngine } from './lemon-squeezy-subscription-payload-builder';

/**
 * @name LemonSqueezyBillingProvider
 * @description This class is used to create a billing strategy for Lemon Squeezy
 */
export class LemonSqueezyBillingProvider implements AbstractBillingProvider {
    private readonly namespace = 'billing.lemon-squeezy';
    public config: BillingConfig;

    constructor(config: BillingConfig) {
        this.config = config;
    }

    /**
     * Strips HTML tags and normalizes whitespace from Lemon Squeezy rich text fields
     */
    private toPlainText(input?: string | null): string {
        if (!input) return '';
        // Convert <br> variations to spaces, then strip all tags
        const withSpaces = input.replace(/<br\s*\/?>(\n)?/gi, ' ');
        const withoutTags = withSpaces.replace(/<[^>]*>/g, ' ');
        return withoutTags.replace(/\s+/g, ' ').trim();
    }

    // duplicated function with the LemonSqueezyBillingCustomer class
    private async getCurrency() {
        await initializeLemonSqueezyClient();
        const store = await getStore(envs().LEMON_SQUEEZY_STORE_ID!); // You need to provide your store ID

        if (store.error) {
            logger.error({ namespace: this.namespace, error: store.error }, 'Failed to get store');
            throw new Error('Failed to get store');
        }

        const storeCurrency = store.data?.data.attributes.currency || 'USD';

        return storeCurrency;
    }

    async fetchProducts() {
        const ctx = {
            namespace: this.namespace,
            config: this.config,
        };

        logger.info(ctx, 'Fetching products...');

        await initializeLemonSqueezyClient();

        // Fetch all products from Lemon Squeezy and filter by configured product IDs
        const { data: productsResponse, error: productsError } = await listProducts();

        if (productsError) {
            logger.error({ namespace: this.namespace, error: productsError }, 'Failed to list products');
            throw new Error('Failed to list products');
        }

        const productIds = this.config.products.map((product) => product.id);
        const filteredProducts =
            (productsResponse?.data ?? []).filter((product) => productIds.includes(product.id)) || [];

        const currency = await this.getCurrency();

        const data = await Promise.all(
            filteredProducts.map(async (product) => {
                const productId = product.id?.toString();
                const configProduct = this.config.products.find((p) => p.id.toString() === productId);
                if (!configProduct) throw new Error(`Product ${productId} not found in config`);

                // List variants (plans/prices) for the product
                const { data: variantsResponse, error: variantsError } = await listVariants({
                    filter: { productId: Number(productId) },
                } as unknown as { filter: { productId: number } });

                if (variantsError) {
                    logger.error(
                        { namespace: this.namespace, productId, error: variantsError },
                        'Failed to list variants for product',
                    );
                    throw new Error('Failed to list variants');
                }

                const variants = variantsResponse?.data ?? [];

                return productSchema.parse({
                    product,
                    active: product?.attributes?.status === 'published' || true,
                    name: product?.attributes?.name ?? '',
                    description: this.toPlainText(product?.attributes?.description) ?? '',
                    imageUrl: product?.attributes?.large_thumb_url ?? null,
                    prices: variants.map((variant) => ({
                        variant,
                        id: variant.id?.toString(),
                        currency: currency,
                        billingScheme: 'per_unit' as const,
                        amount: variant?.attributes?.price ?? 0,
                        type: variant?.attributes?.is_subscription ? ('recurring' as const) : ('one_time' as const),
                        recurring: {
                            interval: (variant?.attributes?.interval ?? null) as
                                | 'day'
                                | 'month'
                                | 'week'
                                | 'year'
                                | null,
                            trialPeriodDays: null,
                        },
                    })),
                    ...configProduct,
                });
            }),
        );

        return {
            data,
            hasMore: false,
        };
    }

    /**
     * @name createCustomer
     * @description Creates a customer in Lemon Squeezy or returns existing customer
     */
    async createCustomer(params: z.infer<typeof createCustomerParamsSchema>) {
        const ctx = {
            namespace: this.namespace,
            ...params,
        };

        logger.info(ctx, 'Creating customer...');

        await initializeLemonSqueezyClient();

        // First, try to create the customer
        const { data, error } = await createLemonSqueezyCustomer(envs().LEMON_SQUEEZY_STORE_ID!, {
            name: params.name,
            email: params.email,
        });

        // If customer was created successfully, return the ID
        if (data?.data?.id) {
            logger.info({ namespace: this.namespace, customerId: data.data.id }, 'Customer created successfully');
            return { customerId: data.data.id.toString() };
        }

        // If error indicates customer already exists, try to find the existing customer
        if (error && this.isCustomerAlreadyExistsError(error)) {
            logger.info(ctx, 'Customer already exists, searching for existing customer...');

            try {
                const existingCustomer = await this.findExistingCustomer(params.email);
                if (existingCustomer) {
                    logger.info(
                        {
                            namespace: this.namespace,
                            customerId: existingCustomer.id,
                            email: params.email,
                        },
                        'Found existing customer',
                    );
                    return { customerId: existingCustomer.id.toString() };
                }
            } catch (searchError) {
                logger.error(
                    {
                        namespace: this.namespace,
                        error: searchError,
                        email: params.email,
                    },
                    'Failed to search for existing customer',
                );
            }
        }

        // If we get here, something went wrong
        logger.error({ namespace: this.namespace, error }, 'Failed to create or find Lemon Squeezy customer');
        throw new Error('Failed to create customer');
    }

    /**
     * @name isCustomerAlreadyExistsError
     * @description Checks if the error indicates customer already exists
     */
    private isCustomerAlreadyExistsError(error: any): boolean {
        return error?.cause?.some(
            (cause: any) =>
                cause?.status === '422' &&
                cause?.detail?.includes('has already been taken') &&
                cause?.source?.pointer === '/data/attributes/email',
        );
    }

    /**
     * @name findExistingCustomer
     * @description Finds an existing customer by email
     */
    private async findExistingCustomer(email: string) {
        const { data, error } = await listCustomers({
            filter: { storeId: envs().LEMON_SQUEEZY_STORE_ID! },
            include: ['store'],
        });

        if (error || !data?.data) {
            throw new Error('Failed to search for existing customers');
        }

        // Find customer with matching email
        const customer = data.data.find((customer: any) => customer.attributes.email === email);

        return customer || null;
    }

    /**
     * @name createCheckoutSession
     * @description Creates a checkout session for a customer
     * @param params
     */
    async createCheckoutSession(params: z.infer<typeof createCheckoutSessionSchema>) {
        const ctx = {
            namespace: this.namespace,
            ...params,
        };

        logger.info(ctx, 'Creating checkout session...');

        // const { data: response, error } = await createLemonSqueezyCheckout(params);
        const { data: response, error } = await createLemonSqueezyCheckout(params);

        if (error ?? !response?.data.id) {
            console.log(error);

            logger.error(
                {
                    ...ctx,
                    error: error?.message,
                },
                'Failed to create checkout session',
            );

            throw new Error('Failed to create checkout session');
        }

        logger.info(ctx, 'Checkout session created successfully');

        return {
            checkoutToken: response.data.attributes.url,
            hostedUrl: response.data.attributes.url,
        };
    }

    /**
     * @name cancelSubscription
     * @description Cancels a subscription
     * @param params
     */
    async cancelSubscription(params: z.infer<typeof cancelSubscriptionParamsSchema>) {
        const ctx = {
            namespace: this.namespace,
            subscriptionId: params.subscriptionId,
        };

        logger.info(ctx, 'Cancelling subscription...');

        await initializeLemonSqueezyClient();

        try {
            const { error } = await cancelSubscription(params.subscriptionId);

            if (error) {
                logger.error(
                    {
                        ...ctx,
                        error: error.message,
                    },
                    'Failed to cancel subscription',
                );

                throw new Error('Failed to cancel subscription');
            }

            logger.info(ctx, 'Subscription cancelled successfully');

            return { success: true };
        } catch (error) {
            logger.info(
                {
                    ...ctx,
                    error: (error as Error)?.message,
                },
                `Failed to cancel subscription. It may have already been cancelled on the user's end.`,
            );

            return { success: false };
        }
    }

    /**
     * @name retrieveCheckoutSession
     * @description Retrieves a checkout session
     * @param params
     */
    async retrieveCheckoutSession(params: z.infer<typeof retrieveCheckoutSessionSchema>) {
        const ctx = {
            namespace: this.namespace,
            sessionId: params.sessionId,
        };

        logger.info(ctx, 'Retrieving checkout session...');

        await initializeLemonSqueezyClient();

        const { data: session, error } = await getCheckout(params.sessionId);

        if (error ?? !session?.data) {
            logger.error(
                {
                    ...ctx,
                    error: error?.message,
                },
                'Failed to retrieve checkout session',
            );

            throw new Error('Failed to retrieve checkout session');
        }

        logger.info(ctx, 'Checkout session retrieved successfully');

        const { id, attributes } = session.data;

        const expiresAt = attributes.expires_at
            ? new Date(attributes.expires_at)
            : new Date(new Date(attributes.created_at).getTime() + 24 * 60 * 60 * 1000);
        const hasExpired = expiresAt < new Date();

        return {
            checkoutToken: id,
            sessionOpen: false,
            status: 'complete' as const,
            customer: {
                email: attributes.checkout_data.email,
            },
            created: attributes.created_at,
            hasExpired,
            raw: session,
        };
    }

    /**
     * @name queryUsage
     * @description Queries the usage of the metered billing
     * @param params
     */
    async updateSubscriptionItem(params: z.infer<typeof updateSubscriptionItemParamsSchema>) {
        const ctx = {
            namespace: this.namespace,
            ...params,
        };

        logger.info(ctx, 'Updating subscription...');

        await initializeLemonSqueezyClient();

        const { error } = await updateSubscriptionItem(params.subscriptionItemId, {
            quantity: params.quantity,
        });

        if (error) {
            logger.error(
                {
                    ...ctx,
                    error,
                },
                'Failed to update subscription',
            );

            throw new Error('Failed to update subscription');
        }

        logger.info(ctx, 'Subscription updated successfully');

        return { success: true };
    }

    async getSubscription(subscriptionId: string) {
        const ctx = {
            namespace: this.namespace,
            subscriptionId,
        };

        logger.info(ctx, 'Retrieving subscription...');

        await initializeLemonSqueezyClient();

        const { error, data } = await getSubscription(subscriptionId);

        if (error) {
            logger.error(
                {
                    ...ctx,
                    error,
                },
                'Failed to retrieve subscription',
            );

            throw new Error('Failed to retrieve subscription');
        }

        if (!data) {
            logger.error(
                {
                    ...ctx,
                },
                'Subscription not found',
            );

            throw new Error('Subscription not found');
        }

        logger.info(ctx, 'Subscription retrieved successfully');

        const payloadBuilderEngine = createLemonSqueezySubscriptionPayloadBuilderEngine();

        const subscription = data.data.attributes;
        const customerId = subscription.customer_id.toString();
        const status = subscription.status;
        const variantId = subscription.variant_id;
        const productId = subscription.product_id;
        const createdAt = subscription.created_at;
        const endsAt = subscription.ends_at;
        const renewsAt = subscription.renews_at;
        const trialEndsAt = subscription.trial_ends_at;
        const intervalCount = subscription.billing_anchor;
        const interval = intervalCount === 1 ? 'month' : 'year';

        const subscriptionItemId = data.data.attributes.first_subscription_item?.id.toString() as string;

        const lineItems = [
            {
                id: subscriptionItemId.toString(),
                product: productId.toString(),
                variant: variantId.toString(),
                quantity: subscription.first_subscription_item?.quantity ?? 1,
                // not anywhere in the API
                priceAmount: 0,
                // we cannot retrieve this from the API, user should retrieve from the billing configuration if needed
                type: '' as never,
            },
        ];

        return payloadBuilderEngine.build({
            email: subscription.user_email,
            name: subscription.user_name,
            customerId,
            id: subscriptionId,
            // not in the API
            accountId: '',
            lineItems,
            status,
            interval,
            intervalCount,
            // not in the API
            currency: '',
            periodStartsAt: new Date(createdAt).getTime(),
            periodEndsAt: new Date(renewsAt ?? endsAt).getTime(),
            cancelAtPeriodEnd: subscription.cancelled,
            trialStartsAt: trialEndsAt ? new Date(createdAt).getTime() : null,
            trialEndsAt: trialEndsAt ? new Date(trialEndsAt).getTime() : null,
        });
    }

    /**
     * @name queryUsage
     * @description Queries the usage of the metered billing
     * @param priceId
     */
    async getPlanById(priceId: string) {
        const ctx = {
            namespace: this.namespace,
            priceId,
        };

        logger.info(ctx, 'Retrieving plan by ID...');

        await initializeLemonSqueezyClient();

        const { error, data } = await getVariant(priceId);

        if (error) {
            logger.error(
                {
                    ...ctx,
                    error,
                },
                'Failed to retrieve plan by ID',
            );

            throw new Error('Failed to retrieve plan by ID');
        }

        if (!data) {
            logger.error(
                {
                    ...ctx,
                },
                'Plan not found',
            );

            throw new Error('Plan not found');
        }

        logger.info(ctx, 'Plan retrieved successfully');

        const attrs = data.data.attributes;

        return {
            id: data.data.id,
            name: attrs.name,
            interval: attrs.interval ?? '',
            description: attrs.description ?? '',
            amount: attrs.price,
            type: attrs.is_subscription ? ('subscription' as const) : ('one-time' as const),
            intervalCount: attrs.interval_count ?? undefined,
        };
    }
}
