import { AbstractBillingCustomer, BillingCustomer } from '@kit/billing-types';
import { createBillingPortalSessionSchema } from '@kit/billing-types/schema';
import { envs } from '@kit/lemon-squeezy/envs';
import { logger } from '@kit/utils';
import {
    getCustomer,
    getStore,
    getVariant,
    Customer as LemonSqueezyCustomer,
    listOrders,
    listSubscriptionInvoices,
    listSubscriptions,
    updateCustomer,
} from '@lemonsqueezy/lemonsqueezy.js';
import { z } from 'zod';
import { initializeLemonSqueezyClient } from './lemon-squeezy-client';

export class LemonSqueezyBillingCustomer implements AbstractBillingCustomer {
    private readonly namespace = 'customer.lemon-squeezy';
    public customerId: string;
    private customer: LemonSqueezyCustomer | null;

    constructor(customerId: string) {
        this.customerId = customerId;
        this.customer = null;
    }

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

    async update(user: Omit<BillingCustomer, 'id' | 'isTestMode'>): Promise<BillingCustomer> {
        const ctx = {
            namespace: this.namespace,
            customerId: this.customerId,
        };

        await initializeLemonSqueezyClient();

        // Map our unified BillingCustomer fields to Lemon Squeezy's allowed attributes
        const attributes: Record<string, string> = {};
        if (user.name) attributes.name = user.name;
        if (user.email) attributes.email = user.email;
        if (user.address?.city) attributes.city = user.address.city;
        if (user.address?.state) attributes.region = user.address.state;
        if (user.address?.country) attributes.country = user.address.country;

        // If nothing to update, just return current state
        if (Object.keys(attributes).length === 0) {
            return await this.fetch();
        }

        try {
            const customerIdNumber = Number(this.customerId);
            if (Number.isNaN(customerIdNumber)) {
                logger.error({ ...ctx, customerId: this.customerId }, 'Invalid customer id for update');
                throw new Error('Invalid customer id');
            }

            const { data, error } = await updateCustomer(customerIdNumber, attributes);

            if (error) {
                logger.error({ ...ctx, error }, 'Failed to update customer');
                throw error;
            }

            const updated = data;

            if (!updated?.data?.id || !updated?.data?.attributes) {
                logger.error({ ...ctx, data: updated }, 'Unexpected update customer response');
                throw new Error('Invalid update customer response');
            }

            // Normalize back to BillingCustomer
            return {
                id: updated.data.id,
                isTestMode: Boolean(updated.data.attributes.test_mode),
                email: updated.data.attributes.email,
                name: updated.data.attributes.name ?? null,
                address: {
                    line1: undefined,
                    line2: undefined,
                    city: updated.data.attributes.city ?? undefined,
                    state: updated.data.attributes.region ?? undefined,
                    postalCode: undefined,
                    country: updated.data.attributes.country ?? undefined,
                },
                phone: undefined,
            };
        } catch (error) {
            logger.error({ ...ctx, error }, 'Error updating Lemon Squeezy customer');
            throw error;
        }
    }

    /**
     * @name createBillingPortalSession
     * @description Creates a billing portal session for a customer
     * @param params
     */
    async createBillingPortalSession(params: z.infer<typeof createBillingPortalSessionSchema>) {
        const ctx = {
            namespace: this.namespace,
            ...params,
        };

        logger.info(ctx, 'Creating billing portal session...');

        await initializeLemonSqueezyClient();

        const customer = await this.getLemonSqueezyCustomer();
        const customerPortal = customer.data.attributes.urls.customer_portal;

        if (!customerPortal) {
            logger.error(
                {
                    ...ctx,
                },
                'Failed to create billing portal session',
            );

            throw new Error('Failed to create billing portal session');
        }

        logger.info(ctx, 'Billing portal session created successfully');

        return { url: customerPortal };
    }

    private async getLemonSqueezyCustomer(): Promise<LemonSqueezyCustomer> {
        const ctx = {
            namespace: this.namespace,
            customerId: this.customerId,
        };

        if (this.customer) {
            return this.customer;
        }

        await initializeLemonSqueezyClient();

        const { data, error } = await getCustomer(this.customerId);

        if (error) {
            logger.error(ctx, 'Failed to fetch customer');
            throw error;
        }

        this.customer = data;
        return this.customer;
    }

    /* 
        export type BillingCustomer = {
    id: string;
    isTestMode: boolean;
    email: string;
    name: string | null;
    address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    phone?: string;
};
        */
    async fetch(): Promise<BillingCustomer> {
        const ctx = {
            namespace: this.namespace,
            customerId: this.customerId,
        };

        logger.info(ctx, 'Fetching customer...');

        const customer = await this.getLemonSqueezyCustomer();

        return {
            id: customer.data.id,
            isTestMode: customer.data.attributes.test_mode,
            email: customer.data.attributes.email,
            name: customer.data.attributes.name,
            address: {
                line1: undefined,
                line2: undefined,
                city: customer.data.attributes.city ?? undefined,
                state: customer.data.attributes.region ?? undefined,
                postalCode: undefined,
                country: customer.data.attributes.country ?? undefined,
            },
            phone: undefined,
        };
    }

    async fetchSubscriptions() {
        const ctx = {
            namespace: this.namespace,
            customerId: this.customerId,
        };

        logger.info(ctx, 'Fetching subscriptions...');

        await initializeLemonSqueezyClient();

        try {
            const customer = await this.fetch();
            const { data: subsResp, error } = await listSubscriptions({
                filter: {
                    userEmail: customer.email ?? undefined,
                },
            } as unknown as { filter: { userEmail: string } });

            if (error) {
                logger.error(ctx, 'Failed to fetch subscriptions');
                throw error;
            }

            const currency = await this.getCurrency();

            const subs = subsResp?.data ?? [];

            return {
                data: await Promise.all(
                    subs.map(async (sub) => {
                        const attrs = sub.attributes ?? {};
                        // const interval = intervalCount === 1 ? 'month' : intervalCount === 7 ? 'week' : 'year';
                        const { data: variant, error: variantError } = await getVariant(sub.attributes.variant_id);

                        if (variantError) {
                            logger.error(ctx, 'Failed to fetch variant');
                            throw variantError;
                        }

                        const statusRaw = (attrs.status as string | undefined)?.toLowerCase();
                        const statusMap: Record<
                            string,
                            | 'active'
                            | 'paused'
                            | 'past_due'
                            | 'unpaid'
                            | 'canceled'
                            | 'incomplete'
                            | 'incomplete_expired'
                            | 'trialing'
                        > = {
                            active: 'active',
                            paused: 'paused',
                            past_due: 'past_due',
                            unpaid: 'unpaid',
                            cancelled: 'canceled',
                            canceled: 'canceled',
                            on_trial: 'trialing',
                            trialing: 'trialing',
                            expired: 'canceled',
                            incomplete: 'incomplete',
                            incomplete_expired: 'incomplete_expired',
                        };
                        const mappedStatus = statusRaw && statusMap[statusRaw] ? statusMap[statusRaw] : 'active';

                        return {
                            id: sub.id?.toString(),
                            productId: (attrs.product_id as number)?.toString() ?? '',
                            name: (attrs?.product_name as string) ?? (attrs?.variant_name as string) ?? 'Subscription',
                            description: undefined,
                            status: mappedStatus,
                            currentPeriodStart: attrs.updated_at
                                ? Math.floor(new Date(attrs.updated_at as string).getTime() / 1000)
                                : Math.floor(new Date(attrs.created_at as string).getTime() / 1000),
                            currentPeriodEnd: attrs.renews_at
                                ? Math.floor(new Date(attrs.renews_at as string).getTime() / 1000)
                                : attrs.ends_at
                                  ? Math.floor(new Date(attrs.ends_at as string).getTime() / 1000)
                                  : Math.floor(Date.now() / 1000),
                            canceledAt: attrs.ends_at
                                ? Math.floor(new Date(attrs.ends_at as string).getTime() / 1000)
                                : null,
                            cancelAtPeriodEnd: Boolean(attrs.cancelled),
                            currency: currency,
                            amount: 0,
                            billingScheme: 'per_unit' as const,
                            interval: variant.data.attributes.interval as 'day' | 'month' | 'week' | 'year',
                            intervalCount: variant.data.attributes.interval_count,
                        };
                    }),
                ),
                hasMore: false,
            };
        } catch (error) {
            logger.error(ctx, 'Failed to fetch subscriptions');

            throw error;
        }
    }

    async fetchPayments() {
        const ctx = {
            namespace: this.namespace,
            customerId: this.customerId,
        };

        logger.info(ctx, 'Fetching payments...');

        await initializeLemonSqueezyClient();

        try {
            const customer = await this.fetch();
            const payments = await listOrders({
                filter: {
                    userEmail: customer.email ?? undefined,
                },
            });

            if (payments.error) {
                logger.error(ctx, 'Failed to fetch payments');

                throw payments.error;
            }

            return payments.data;
        } catch (error) {
            logger.error(ctx, 'Failed to fetch payments');

            throw error;
        }
    }

    async fetchInvoices() {
        const ctx = {
            namespace: this.namespace,
            customerId: this.customerId,
        };

        logger.info(ctx, 'Fetching invoices...');

        await initializeLemonSqueezyClient();

        try {
            // Fetch the Lemon Squeezy customer to get their email
            const customer = await this.getLemonSqueezyCustomer();

            const currency = await this.getCurrency();

            const customerEmail = customer.data.attributes.email as string | undefined;

            if (!customerEmail) {
                logger.error(ctx, 'Missing customer email; cannot list subscriptions/invoices');
                return { data: [], hasMore: false };
            }

            // List subscriptions for this customer by email
            const { data: subsResp, error: subsErr } = await listSubscriptions({
                filter: { userEmail: customerEmail },
            } as unknown as { filter: { userEmail: string } });

            if (subsErr) {
                logger.error({ ...ctx, error: subsErr }, 'Failed to list subscriptions for invoices');
                throw new Error('Failed to list subscriptions');
            }

            const subscriptions = subsResp?.data ?? [];

            // For each subscription, list its invoices
            const invoiceGroups = await Promise.all(
                subscriptions.map(async (sub) => {
                    const subscriptionId = sub.id?.toString();
                    const { data: invResp, error: invErr } = await listSubscriptionInvoices({
                        filter: { subscriptionId: Number(subscriptionId) },
                    } as unknown as { filter: { subscriptionId: number } });

                    if (invErr) {
                        logger.error(
                            { ...ctx, subscriptionId, error: invErr },
                            'Failed to list invoices for subscription',
                        );
                        return [] as any[];
                    }

                    return invResp?.data ?? [];
                }),
            );

            const invoicesFlat = invoiceGroups.flat();

            const data = invoicesFlat.map((invoice) => {
                const attrs = invoice.attributes ?? {};
                const statusRaw = (attrs.status as string | undefined)?.toLowerCase();

                const statusMap: Record<string, 'paid' | 'open' | 'draft' | 'void' | 'uncollectible'> = {
                    paid: 'paid',
                    pending: 'open',
                    open: 'open',
                    draft: 'draft',
                    failed: 'void',
                    refunded: 'void',
                    void: 'void',
                    uncollectible: 'uncollectible',
                };

                const mappedStatus = statusRaw && statusMap[statusRaw] ? statusMap[statusRaw] : 'open';

                return {
                    attrs,
                    id: invoice.id?.toString(),
                    amount: (attrs.total as number) ?? 0,
                    currency: currency,
                    label: attrs.number ? `#${attrs.number}` : 'Invoice',
                    status: mappedStatus,
                    downloadUrl: (attrs.urls?.invoice_url as string | undefined) ?? undefined,
                    date: attrs.created_at
                        ? Math.floor(new Date(attrs.created_at as string).getTime() / 1000)
                        : Math.floor(Date.now() / 1000),
                    lines: [] as {
                        id: string;
                        amount: number;
                        label: string;
                        currency: string;
                        quantity: number;
                    }[],
                };
            });

            return {
                data,
                hasMore: false,
            };
        } catch (error) {
            logger.error({ ...ctx, error }, 'Failed to fetch invoices');
            throw error;
        }
    }
}
