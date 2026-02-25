import { billingConfigSchema } from '@kit/billing-types';
import { AppClient } from '@kit/db';
import { logger } from '@kit/utils';
import Stripe from 'stripe';
import { z } from 'zod';
import { BillingHandler } from '../server/billing-gateway/billing-handler';

export const createBillingPortalSessionUrlSchema = z.object({
    config: billingConfigSchema,
    returnUrl: z.string().url(),
});

export async function createBillingPortalSessionUrlAction(
    { config, returnUrl }: z.infer<typeof createBillingPortalSessionUrlSchema>,
    { db }: { db: AppClient },
) {
    const billingHandler = new BillingHandler(config, db);
    const billingCustomer = await billingHandler.getBillingCustomer();

    logger.info(`Creating billing portal session...`);

    try {
        const billingPortalSession = await billingCustomer.createBillingPortalSession({
            returnUrl: returnUrl,
        });

        return { url: billingPortalSession.url };
    } catch (error) {
        if (error instanceof Stripe.errors.StripeError) {
            throw new Error(`Failed to update billing address: ${error.message}`);
        }
        throw error;
    }
}
