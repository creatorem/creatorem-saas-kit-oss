import { AppClient } from '@kit/db';
import { logger } from '@kit/utils';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { updateBillingCustomerSchema as schema } from '../schemas/update-billing-customer.schema';
import { BillingHandler } from '../server/billing-gateway/billing-handler';

export const updateBillingCustomerSchema = schema;

export async function updateBillingCustomerAction(
    input: z.infer<typeof updateBillingCustomerSchema>,
    { db }: { db: AppClient },
) {
    const billingHandler = new BillingHandler(input.config, db);
    const billingCustomer = await billingHandler.getBillingCustomer();

    logger.info(
        {
            input,
        },
        `Updating billing customer...`,
    );

    try {
        const customer = await billingCustomer.update({
            email: input.email,
            name: input.name ?? null,
            address: {
                line1: input.line1,
                line2: input.line2,
                country: input.country,
                postalCode: input.postalCode,
                city: input.city,
                state: input.state,
            },
        });

        revalidatePath(input.revalidateUrl);

        return customer;
    } catch (error) {
        logger.error(
            {
                error,
            },
            `Error creating the checkout session`,
        );
        throw error;
    }
}
