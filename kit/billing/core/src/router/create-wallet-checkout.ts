import { billingConfigSchema } from '@kit/billing-types';
import { AppClient } from '@kit/db';
import { logger } from '@kit/utils';
import { z } from 'zod';
import { createWalletTopUpCheckout } from '../server/wallet/wallet-service-handler';

export const createWalletCheckoutSchema = z.object({
    config: billingConfigSchema,
    amount: z.number().positive().min(1).max(10000),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
    variantId: z.string().optional(), // For Lemon Squeezy
});

export async function createWalletCheckoutAction(
    { config, ...params }: z.infer<typeof createWalletCheckoutSchema>,
    { db }: { db: AppClient },
): Promise<{ data: { checkoutUrl: string } | null; error?: string }> {
    try {
        // Validate input
        const validatedParams = createWalletCheckoutSchema.parse(params);

        const user = await db.user.require();

        // Create checkout session using the provider-agnostic service
        const result = await createWalletTopUpCheckout(config, {
            amount: validatedParams.amount,
            currency: 'USD',
            userId: user.id,
            customerEmail: user.email ?? undefined,
            variantId: validatedParams.variantId,
            successUrl: validatedParams.successUrl,
            cancelUrl: validatedParams.cancelUrl,
        });

        logger.info(
            {
                userId: user.id,
                provider: config.provider,
                amount: validatedParams.amount,
            },
            'Created wallet checkout session',
        );

        return { data: { checkoutUrl: result.url } };
    } catch (error) {
        logger.error({ error }, 'Failed to create wallet checkout');

        if (error instanceof z.ZodError) {
            return { data: null, error: 'Invalid checkout parameters' };
        }

        return { data: null, error: 'Failed to create checkout session' };
    }
}
