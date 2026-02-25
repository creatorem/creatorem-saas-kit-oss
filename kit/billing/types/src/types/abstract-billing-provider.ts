import { z } from 'zod';

import { BillingConfig, BillingProduct, PaymentType } from '../create-billing-schema';
import {
    cancelSubscriptionParamsSchema,
    createCheckoutSessionSchema,
    createCustomerParamsSchema,
    retrieveCheckoutSessionSchema,
    updateSubscriptionItemParamsSchema,
} from '../schema';
import { BillingList } from './abstract-billing-customer';
import { UpsertSubscriptionParams } from './params';

/* 
{
    "id": "prod_SnZo9gjf64pu8V",
    "object": "product",
    "active": true,
    "attributes": [],
    "created": 1754214991,
    "default_price": "price_1Rrz4pFoH9EGCXA37FLUn9eN",
    "description": "Free plan of the creatorem dashboard app. In development environment.",
    "images": [],
    "livemode": false,
    "marketing_features": [],
    "metadata": {},
    "name": "Dev Starter",
    "package_dimensions": null,
    "shippable": null,
    "statement_descriptor": null,
    "tax_code": null,
    "type": "service",
    "unit_label": null,
    "updated": 1754231627,
    "url": null
}
*/

/* 
{
    "id": "price_1Rrz4pFoH9EGCXA37FLUn9eN",
    "object": "price",
    "active": true,
    "billing_scheme": "per_unit",
    "created": 1754216619,
    "currency": "eur",
    "custom_unit_amount": null,
    "livemode": false,
    "lookup_key": null,
    "metadata": {},
    "nickname": null,
    "product": "prod_SnZo9gjf64pu8V",
    "recurring": {
        "interval": "month",
        "interval_count": 1,
        "meter": null,
        "trial_period_days": null,
        "usage_type": "licensed"
    },
    "tax_behavior": "unspecified",
    "tiers_mode": null,
    "transform_quantity": null,
    "type": "recurring",
    "unit_amount": 900,
    "unit_amount_decimal": "900"
    }
    */

// export type BillingPrice = {
//     id: string;
//     currency: string;
//     billingScheme: 'per_unit' | 'tiered';
//     amount: number;
//     type: "recurring" | "one_time"
//     recurring: {
//         interval: 'day' | 'month' | 'week' | 'year' | null;
//         trialPeriodDays: number | null;
//     };
// };

// export type BillingProduct = Product & {
//     active: boolean;
//     name: string;
//     description: string;
//     imageUrl: string | null;
//     prices: BillingPrice[];
// };

export abstract class AbstractBillingProvider {
    abstract config: BillingConfig;

    abstract createCustomer(params: z.infer<typeof createCustomerParamsSchema>): Promise<{
        customerId: string;
    }>;

    abstract fetchProducts(): Promise<BillingList<BillingProduct>>;

    abstract retrieveCheckoutSession(params: z.infer<typeof retrieveCheckoutSessionSchema>): Promise<{
        checkoutToken: string | null;
        status: 'complete' | 'expired' | 'open';
        sessionOpen: boolean;
        customer: {
            email: string | null;
        };
        created: string;
        hasExpired: boolean;
        raw: unknown;
    }>;

    abstract createCheckoutSession(params: z.infer<typeof createCheckoutSessionSchema>): Promise<{
        checkoutToken: string | null;
        hostedUrl: string | null;
    }>;

    abstract cancelSubscription(params: z.infer<typeof cancelSubscriptionParamsSchema>): Promise<{
        success: boolean;
    }>;

    abstract updateSubscriptionItem(params: z.infer<typeof updateSubscriptionItemParamsSchema>): Promise<{
        success: boolean;
    }>;

    abstract getPlanById(priceId: string): Promise<{
        id: string;
        name: string;
        description?: string;
        interval: string;
        amount: number;
        type: PaymentType;
        intervalCount?: number;
    }>;

    abstract getSubscription(subscriptionId: string): Promise<
        UpsertSubscriptionParams & {
            targeted_account_id: string | null;
        }
    >;
}
