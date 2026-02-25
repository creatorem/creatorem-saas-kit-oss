import { Json } from '@kit/db';
import { BillingProvider } from '../create-billing-schema';

interface LineItem {
    id: string;
    quantity: number;
    subscription_id: string;
    subscription_item_id: string;
    product_id: string;
    variant_id: string;
    price_amount: number | null | undefined;
    interval: string;
    interval_count: number;
    type: 'flat' | 'metered' | 'per_seat' | undefined;
}

export type UpsertSubscriptionParams = {
    customer_details: {
        address: {
            city: string | null;
            country: string | null;
            line1: string | null;
            line2: string | null;
            postal_code: string | null;
            state: string | null;
        } | null;
        email: string | null;
        name: string | null;
        phone: string | null;
    } | null;
    targeted_account_id: string | null;
    target_customer_id: string;
    target_subscription_id: string;
    active: boolean;
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused';
    billing_provider: BillingProvider;
    cancel_at_period_end: boolean;
    currency: string;
    period_starts_at: string;
    period_ends_at: string;
    trial_starts_at?: string;
    trial_ends_at?: string;
    line_items: Array<LineItem>;
};

export type UpsertOrderParams = {
    customer_details: {
        address: {
            city: string | null;
            country: string | null;
            line1: string | null;
            line2: string | null;
            postal_code: string | null;
            state: string | null;
        } | null;
        email: string | null;
        name: string | null;
        phone: string | null;
    } | null;
    targeted_account_id: string | null;
    target_customer_id: string;
    target_order_id: string;
    status: 'pending' | 'succeeded' | 'failed';
    billing_provider: BillingProvider;
    total_amount: number;
    currency: string;
    line_items: Json;
};
