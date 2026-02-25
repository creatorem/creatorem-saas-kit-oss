import { type BillingCustomer, billingConfigSchema } from '@kit/billing-types';
import { AppClient } from '@kit/db';
import { z } from 'zod';
import { BillingHandler } from '../server/billing-gateway/billing-handler';

export const getBillingCustomerSchema = z.object({
    config: billingConfigSchema,
});

export async function getBillingCustomerAction(
    { config }: z.infer<typeof getBillingCustomerSchema>,
    { db }: { db: AppClient },
): Promise<BillingCustomer> {
    const billing = new BillingHandler(config, db);
    const billingCustomer = await billing.getBillingCustomer();
    const customer = await billingCustomer.fetch();

    return customer;
}
