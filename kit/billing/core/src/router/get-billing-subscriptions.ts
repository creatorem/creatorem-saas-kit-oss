import { type BillingList, type BillingSubscription, billingConfigSchema } from '@kit/billing-types';
import { AppClient } from '@kit/db';
import { z } from 'zod';
import { BillingHandler } from '../server/billing-gateway/billing-handler';

export const getBillingSubscriptionsSchema = z.object({
    config: billingConfigSchema,
});

export async function getBillingSubscriptionsAction(
    { config }: z.infer<typeof getBillingSubscriptionsSchema>,
    { db }: { db: AppClient },
): Promise<BillingList<BillingSubscription>> {
    const billing = new BillingHandler(config, db);
    const billingCustomer = await billing.getBillingCustomer();
    const subscriptions = await billingCustomer.fetchSubscriptions();
    return subscriptions;
}
