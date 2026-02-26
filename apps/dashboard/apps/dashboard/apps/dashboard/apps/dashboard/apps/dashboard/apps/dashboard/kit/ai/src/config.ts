import { z } from 'zod';

/**
 * Schema for AI model pricing configuration
 * Prices are per 1M tokens in the billing currency
 */
const modelPricingSchema = z.object({
    inputTokens: z.number({
        description: 'Cost per 1M input tokens',
    }),
    outputTokens: z.number({
        description: 'Cost per 1M output tokens',
    }),
    reasoningTokens: z.number({
        description: 'Cost per 1M reasoning tokens',
    }),
    cachedInputTokens: z.number({
        description: 'Cost per 1M cached input tokens',
    }),
});

/**
 * Schema for AI model configuration
 */
const modelConfigSchema = z.object({
    id: z.string({
        description: 'Model identifier',
    }),
    name: z.string({
        description: 'Human-readable model name',
    }),
});

/**
 * Schema for interval-based included amounts
 */
const intervalAmountsSchema = z
    .object({
        day: z.number().optional(),
        week: z.number().optional(),
        month: z.number().optional(),
        year: z.number().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, { message: 'At least one interval must be specified' });

/**
 * Schema for AI configuration
 */
export const aiConfigSchema = z.object({
    /**
     * Global context that will be included in all AI requests
     */
    globalContext: z.string({
        description: 'Global context for AI interactions',
    }),
    /**
     * Available models that users can select from
     */
    availableModels: z.array(modelConfigSchema, {
        description: 'List of available AI models',
    }),
    /**
     * Default model to use when multiple models are available
     * Should match one of the model IDs in availableModels
     */
    defaultModel: z
        .string({
            description: 'Default model ID to use',
        })
        .optional(),
    /**
     * Pricing configuration for different AI models
     * Prices are per 1M tokens in the billing currency
     */
    pricing: z.record(
        z.string({
            description: 'Model ID',
        }),
        modelPricingSchema,
        {
            description: 'Pricing per model ID',
        },
    ),
    /**
     * Included AI amount per subscription product
     * Maps billing product IDs to their included AI credit amounts
     * Can be either:
     * - A number (applies to all intervals)
     * - An object with interval-specific amounts: { day?: number, week?: number, month?: number, year?: number }
     */
    includedAmountPerSubscription: z
        .record(
            z.string({
                description: 'Billing product ID',
            }),
            z.union([
                z.number({
                    description: 'Included AI credit amount (applies to all intervals)',
                }),
                intervalAmountsSchema,
            ]),
            {
                description: 'Included amount per subscription product',
            },
        )
        .optional(),
});

export type AiConfig = z.infer<typeof aiConfigSchema>;
export type ModelPricing = z.infer<typeof modelPricingSchema>;
export type ModelConfig = z.infer<typeof modelConfigSchema>;
export type IntervalAmounts = z.infer<typeof intervalAmountsSchema>;

/**
 * Parse and validate AI configuration
 * @param config - The AI configuration object
 * @returns Validated AI configuration
 */
export const parseAiConfig = (config: AiConfig) => {
    return aiConfigSchema.parse({ ...config });
};

/**
 * Get the included amount for a specific product and interval
 * @param config - The AI configuration
 * @param productId - The billing product ID
 * @param interval - The subscription interval ('day' | 'week' | 'month' | 'year')
 * @returns The included amount for the specified interval, or undefined if not found
 */
export const getIncludedAmountForInterval = (
    config: AiConfig,
    productId: string,
    interval: 'day' | 'week' | 'month' | 'year',
): number | undefined => {
    if (!config.includedAmountPerSubscription) {
        return undefined;
    }

    const includedAmount = config.includedAmountPerSubscription[productId];

    if (includedAmount === undefined) {
        return undefined;
    }

    // If it's a simple number, return it for all intervals
    if (typeof includedAmount === 'number') {
        return includedAmount;
    }

    // Otherwise, return the interval-specific amount
    return includedAmount[interval];
};
