import { z } from 'zod';

export enum LineItemType {
    Flat = 'flat',
    PerSeat = 'per_seat',
    Metered = 'metered',
}

/** @todo to implement */
const billingIntervalSchema = z.enum(['month', 'year']);
/** @todo implemented metered feature */
const lineItemTypeSchema = z.enum(['flat', 'per_seat', 'metered']);

const billingProviderSchema = z.enum(['stripe', 'lemon-squeezy']);

const paymentTypeSchema = z.enum(['one-time', 'subscription']);

/**
 * The organization feature must be implemented.
 */
const billingAttachedTableSchema = z.enum(['user', 'organization']);

export const lineItemSchema = z.object({
    id: z.string().min(1),
    type: lineItemTypeSchema,
});

const configProductSchema = z.object({
    id: z.string().min(1),
    popular: z.boolean().optional(),
    features: z.array(z.string()).nonempty(),
    enableDiscount: z.boolean().optional(),
    hidden: z.boolean().optional(),
});

export const billingConfigSchema = z.object({
    /**
     * The billing provider to use.
     */
    provider: billingProviderSchema,
    /**
     * The currency to use.
     * @default 'USD'
     */
    currency: z.string().min(1).default('USD'),
    /**
     * The checkout UI to use.
     * @default 'hosted'
     */
    checkoutUI: z.enum(['hosted', 'embedded']).default('hosted').optional(),
    /**
     * Control the checkout session access. By default, only authenticated users can buy something.
     * @default 'authenticated'
     */
    access: z.enum(['authenticated', 'public']).default('authenticated').optional(),
    /**
     * The table to attach the billing to.
     * Either 'user' or 'organization'.
     * @default 'user'
     */
    attachedTable: billingAttachedTableSchema.default('user'),
    /**
     * The URL to redirect to when the user clicks the "Go Back" button in hosted checkout.
     * @default null
     */
    goBackUrl: z.string().url().optional(),
    /**
     * The number of decimals to use for the prices.
     * @default 2
     */
    numberAfterComma: z.number().default(2).optional(),
    /**
     * The products to display in the pricing page.
     */
    products: z.array(configProductSchema).nonempty(),
    checkout: z
        .object({
            submit: z
                .object({
                    /**
                     * Not implemented with Stripe yet. It works with Lemon Squeezy.
                     */
                    text: z.string().optional(),
                    /**
                     * Not implemented with Stripe yet. It works with Lemon Squeezy.
                     */
                    color: z
                        .object({
                            text: z.string().optional(),
                            background: z.string().optional(),
                        })
                        .optional(),
                })
                .optional(),
        })
        .optional(),
});

export type BillingConfig = z.infer<typeof billingConfigSchema>;

export function parseBillingConfig(config: BillingConfig): BillingConfig {
    return billingConfigSchema.parse(config);
}

const billingPriceSchema = z.object({
    id: z.string().min(1),
    currency: z.string().min(1),
    billingScheme: z.enum(['per_unit', 'tiered']),
    amount: z.number(),
    type: z.enum(['recurring', 'one_time']),
    recurring: z.object({
        interval: z.enum(['day', 'month', 'week', 'year']).nullable(),
        trialPeriodDays: z.number().nullable(),
    }),
});

export const productSchema = configProductSchema.extend({
    active: z.boolean(),
    name: z.string().min(1),
    description: z.string(),
    imageUrl: z.string().url().nullable(),
    prices: z.array(billingPriceSchema).nonempty(),
});

export type BillingPrice = z.infer<typeof billingPriceSchema>;
export type BillingProduct = z.infer<typeof productSchema>;
export type BillingAttachedTable = z.infer<typeof billingAttachedTableSchema>;
export type BillingProvider = z.infer<typeof billingProviderSchema>;
export type PaymentType = z.infer<typeof paymentTypeSchema>;
export type PriceTypeMap = Map<string, z.infer<typeof lineItemTypeSchema>>;
