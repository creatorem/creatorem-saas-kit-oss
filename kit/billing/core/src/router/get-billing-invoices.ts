import { type BillingInvoice, type BillingList, billingConfigSchema } from '@kit/billing-types';
import { AppClient } from '@kit/db';
import { z } from 'zod';
import { BillingHandler } from '../server/billing-gateway/billing-handler';

export const getBillingInvoicesSchema = z.object({
    config: billingConfigSchema,
});

export async function getBillingInvoicesAction(
    { config }: z.infer<typeof getBillingInvoicesSchema>,
    { db }: { db: AppClient },
): Promise<BillingList<BillingInvoice>> {
    const billing = new BillingHandler(config, db);
    const billingCustomer = await billing.getBillingCustomer();
    const invoices = await billingCustomer.fetchInvoices();
    return invoices;
}
