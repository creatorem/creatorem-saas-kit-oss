import { AppClient } from '@kit/db';
import z from 'zod';
import { BillingHandler } from '../server';

export const getBillingDetailsSchema = z.object({
    config: z.any(),
});

export const getBillingDetailsAction = async (
    { config }: z.infer<typeof getBillingDetailsSchema>,
    { db }: { db: AppClient },
) => {
    const billing = new BillingHandler(config, db);
    const billingCustomer = await billing.getBillingCustomer();

    const customer = await billingCustomer.fetch();
    const products = await billing.fetchProducts();
    const subscriptions = await billingCustomer.fetchSubscriptions();
    const invoices = await billingCustomer.fetchInvoices();

    return {
        customer,
        products,
        subscriptions,
        invoices,
    };
};
