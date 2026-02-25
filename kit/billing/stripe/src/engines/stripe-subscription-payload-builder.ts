import { UpsertSubscriptionParams } from '@kit/billing-types';
import type Stripe from 'stripe';

export function createStripeSubscriptionPayloadBuilderEngine() {
    return new StripeSubscriptionPayloadBuilderEngine();
}

class StripeSubscriptionPayloadBuilderEngine {
    build<
        LineItem extends {
            id: string;
            quantity?: number;
            price?: Stripe.Price;
            type: 'flat' | 'per_seat' | 'metered';
        },
    >(params: {
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
        id: string;
        accountId: string | null;
        customerId: string;
        lineItems: LineItem[];
        status: Stripe.Subscription.Status;
        currency: string;
        cancelAtPeriodEnd: boolean;
        periodStartsAt: number;
        periodEndsAt: number;
        trialStartsAt: number | null;
        trialEndsAt: number | null;
    }): UpsertSubscriptionParams {
        const active = params.status === 'active' || params.status === 'trialing';

        const lineItems = params.lineItems.map((item) => {
            const quantity = item.quantity ?? 1;
            const variantId = item.price?.id as string;

            return {
                customer_details: params.customer_details,
                id: item.id,
                quantity,
                subscription_id: params.id,
                subscription_item_id: item.id,
                product_id: item.price?.product as string,
                variant_id: variantId,
                price_amount: item.price?.unit_amount,
                interval: item.price?.recurring?.interval as string,
                interval_count: item.price?.recurring?.interval_count as number,
                type: item.type,
            };
        });

        return {
            customer_details: params.customer_details,
            target_subscription_id: params.id,
            targeted_account_id: params.accountId,
            target_customer_id: params.customerId,
            billing_provider: 'stripe',
            status: params.status,
            line_items: lineItems,
            active,
            currency: params.currency,
            cancel_at_period_end: params.cancelAtPeriodEnd ?? false,
            period_starts_at: getISOString(params.periodStartsAt) as string,
            period_ends_at: getISOString(params.periodEndsAt) as string,
            trial_starts_at: getISOString(params.trialStartsAt),
            trial_ends_at: getISOString(params.trialEndsAt),
        };
    }

    getPeriodStartsAt(subscription: Stripe.Subscription) {
        // for stripe <= 17
        if ('current_period_start' in subscription) {
            return subscription.current_period_start as number;
        }

        const firstItem = (subscription as unknown as { items?: { data?: Array<{ current_period_start?: number }> } })
            .items?.data?.[0];
        return (
            (firstItem?.current_period_start as number) ??
            (subscription as unknown as { current_period_start?: number }).current_period_start ??
            Math.floor(Date.now() / 1000)
        );
    }

    /**
     * @name getPeriodEndsAt
     * @description Get the period ends at for the subscription
     * @param subscription
     */
    getPeriodEndsAt(subscription: Stripe.Subscription) {
        // for stripe <= 17
        if ('current_period_end' in subscription) {
            return subscription.current_period_end as number;
        }

        const firstItem = (subscription as unknown as { items?: { data?: Array<{ current_period_end?: number }> } })
            .items?.data?.[0];
        return (
            (firstItem?.current_period_end as number) ??
            (subscription as unknown as { current_period_end?: number }).current_period_end ??
            Math.floor(Date.now() / 1000)
        );
    }
}

function getISOString(date: number | null) {
    return date ? new Date(date * 1000).toISOString() : undefined;
}
