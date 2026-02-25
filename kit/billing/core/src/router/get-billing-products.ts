import { type BillingList, type BillingProduct, billingConfigSchema } from '@kit/billing-types';
import { AppClient } from '@kit/db';
import { z } from 'zod';
import { BillingHandler } from '../server/billing-gateway/billing-handler';

export const getBillingProductsSchema = z.object({
    config: billingConfigSchema,
});

export async function getBillingProductsAction(
    { config }: z.infer<typeof getBillingProductsSchema>,
    { db }: { db: AppClient },
): Promise<BillingList<BillingProduct>> {
    const billing = new BillingHandler(config, db);
    const products = await billing.fetchProducts();
    return products;
}
