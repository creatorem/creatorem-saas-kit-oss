import { AbstractBillingCustomer, BillingCustomer, BillingListParams } from '@kit/billing-types';
import { createBillingPortalSessionSchema } from '@kit/billing-types/schema';
import { logger } from '@kit/utils';
import type { Maybe } from '@kit/utils/types/maybe';
import type { Stripe } from 'stripe';
import { z } from 'zod';
import { createStripeClient } from './stripe-server';

export class StripeBillingCustomer implements AbstractBillingCustomer {
    private readonly namespace = 'customer.stripe';
    public customerId: string;

    constructor(customerId: string) {
        this.customerId = customerId;
    }

    private async stripeProvider(): Promise<Stripe> {
        return createStripeClient();
    }

    async createBillingPortalSession(params: z.infer<typeof createBillingPortalSessionSchema>) {
        const stripe = await this.stripeProvider();

        const ctx = {
            namespace: this.namespace,
            customerId: this.customerId,
        };

        logger.info(ctx, 'Creating billing portal session...');

        const session = await stripe.billingPortal.sessions.create({
            customer: this.customerId,
            return_url: params.returnUrl,
        });

        if (!session?.url) {
            logger.error(ctx, 'Failed to create billing portal session');
        } else {
            logger.info(ctx, 'Billing portal session created successfully');
        }

        return session;
    }

    async fetch(): Promise<BillingCustomer> {
        const stripe = await this.stripeProvider();

        const customer = await stripe.customers.retrieve(this.customerId);

        if ('deleted' in customer) {
            throw new Error('Customer has been deleted');
        }

        return {
            id: customer.id,
            isTestMode: typeof customer.livemode === 'boolean' ? !customer.livemode : false,
            email: customer.email ?? '',
            name: customer.name ?? '',
            address: {
                line1: customer.address?.line1 ?? undefined,
                line2: customer.address?.line2 ?? undefined,
                city: customer.address?.city ?? undefined,
                state: customer.address?.state ?? undefined,
                postalCode: customer.address?.postal_code ?? undefined,
                country: customer.address?.country ?? undefined,
            },
            phone: customer.phone ?? '',
        };
    }

    async update(user: Omit<BillingCustomer, 'id' | 'isTestMode'>) {
        const stripe = await this.stripeProvider();

        const customer = await stripe.customers.update(this.customerId, {
            address: {
                line1: user.address?.line1 ?? undefined,
                line2: user.address?.line2 ?? undefined,
                city: user.address?.city ?? undefined,
                state: user.address?.state ?? undefined,
                postal_code: user.address?.postalCode ?? undefined,
                country: user.address?.country ?? undefined,
            },
            name: user.name ?? undefined,
            email: user.email ?? undefined,
            phone: user.phone ?? undefined,
        });

        return {
            id: customer.id,
            isTestMode: typeof customer.livemode === 'boolean' ? !customer.livemode : false,
            email: customer.email ?? '',
            name: customer.name ?? '',
            address: customer.address ?? {},
            phone: customer.phone ?? '',
        };
    }

    async fetchSubscriptions(params: BillingListParams = {}) {
        const stripe = await this.stripeProvider();

        const subscriptions = await stripe.subscriptions.list({
            customer: this.customerId,
        });

        return {
            data: await Promise.all(
                (subscriptions.data as (Stripe.Subscription & { plan?: Stripe.Plan })[]).map(async (subscription) => {
                    const subscriptionItem = subscription.items.data.find(
                        (item) =>
                            item.object === 'subscription_item' && item.plan?.product === subscription.plan?.product,
                    );
                    if (!subscriptionItem) throw new Error('Subscription item not found');

                    const productId = subscription?.plan?.product as Maybe<string>;
                    if (!productId) {
                        throw new Error('Product ID not found');
                    }
                    const product = await stripe.products.retrieve(productId);

                    const amount = subscription?.plan?.amount;
                    if (!amount) throw new Error('Amount not found');

                    const billingScheme = subscription?.plan?.billing_scheme;
                    if (!billingScheme) throw new Error('Billing scheme not found');

                    const interval = subscription?.plan?.interval;
                    if (!interval) throw new Error('Interval not found');

                    return {
                        subscription,
                        id: subscription.id,
                        productId: productId,
                        name: product.name ?? '',
                        description: product.description ?? '',
                        status: subscription.status,
                        currentPeriodStart: subscriptionItem?.current_period_start ?? NaN,
                        currentPeriodEnd: subscriptionItem?.current_period_end ?? NaN,
                        canceledAt: subscription.canceled_at,
                        cancelAtPeriodEnd: subscription.cancel_at_period_end,
                        currency: subscription.currency,
                        amount: amount,
                        billingScheme: billingScheme,
                        interval: interval,
                        intervalCount: subscription.plan?.interval_count ?? null,
                    };
                }),
            ),
            hasMore: subscriptions.has_more,
        };
    }

    async fetchInvoices(params?: BillingListParams) {
        const stripe = await this.stripeProvider();

        const invoices = await stripe.invoices.list({
            customer: this.customerId,
            limit: params?.limit,
        });

        return {
            data: invoices.data.map((invoice) => {
                const status = invoice.status;
                if (!status) throw new Error('Status not found');
                if (!invoice.id) throw new Error('Invoice ID not found');

                return {
                    id: invoice.id,
                    amount: invoice.amount_paid,
                    currency: invoice.currency,
                    label: invoice.number ? `#${invoice.number}` : 'No number',
                    status: status,
                    downloadUrl: invoice.invoice_pdf ?? undefined,
                    date: invoice.created,
                    lines: invoice.lines.data.map((line) => ({
                        id: line.id,
                        amount: line.amount,
                        label: line.description ?? '',
                        currency: line.currency,
                        quantity: line.quantity ?? 1,
                    })),
                };
            }),
            hasMore: invoices.has_more,
        };
    }
}
