import { z } from 'zod';
import { createBillingPortalSessionSchema } from '../schema';

export type BillingListParams = {
    limit?: number;
    offset?: number;
};

export type BillingList<T> = {
    data: T[];
    hasMore: boolean;
};

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

export type BillingSubscription = {
    id: string;
    productId: string;
    name: string;
    description?: string;
    status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'paused' | 'trialing' | 'unpaid';
    currentPeriodStart: number;
    currentPeriodEnd: number;
    canceledAt: number | null;
    cancelAtPeriodEnd: boolean;
    currency: string;
    amount: number;
    billingScheme: 'per_unit' | 'tiered';
    interval: 'year' | 'month' | 'day' | 'week';
    intervalCount?: number | null;
};

export type BillingInvoice = {
    id: string;
    amount: number;
    currency: string;
    label: string;
    status: 'paid' | 'open' | 'draft' | 'void' | 'uncollectible';
    downloadUrl?: string;
    date: number;
    lines: {
        id: string;
        amount: number;
        label: string;
        currency: string;
        quantity: number;
    }[];
};

export abstract class AbstractBillingCustomer {
    abstract customerId: string;

    abstract fetch(): Promise<BillingCustomer>;

    abstract update(user: Omit<BillingCustomer, 'id' | 'isTestMode'>): Promise<BillingCustomer>;

    abstract fetchSubscriptions(params?: BillingListParams): Promise<BillingList<BillingSubscription>>;

    abstract fetchInvoices(params?: BillingListParams): Promise<BillingList<BillingInvoice>>;

    abstract createBillingPortalSession(params: z.infer<typeof createBillingPortalSessionSchema>): Promise<{
        url: string;
    }>;
}
