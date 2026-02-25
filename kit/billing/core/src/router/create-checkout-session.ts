import { billingConfigSchema } from '@kit/billing-types';
import { AppClient } from '@kit/db';
import { logger } from '@kit/utils';
import { z } from 'zod';
import { getProductAndPrice } from '../react/utils/products';
import { BillingHandler } from '../server/billing-gateway/billing-handler';

export const createCheckoutSessionSchema = z.object({
    config: billingConfigSchema,
    productId: z.string().min(1),
    priceId: z.string().min(1),
    returnUrl: z.string().url(),
});

export async function createCheckoutSessionAction(
    input: z.infer<typeof createCheckoutSessionSchema>,
    { db }: { db: AppClient },
) {
    console.log('createCheckoutSessionAction');
    const billingHandler = new BillingHandler(input.config, db);

    const products = await billingHandler.fetchProducts();
    const { price, product } = getProductAndPrice(products.data, input.priceId);

    if (!price || !product) {
        logger.error(
            {
                products,
                priceId: input.priceId,
            },
            'Price or product not found in the products list',
        );
        throw new Error('Price or product not found in the products list');
    }

    const user = input.config.access === 'public' ? null : await db.user.require();

    // only one item because it is to subscribe to a single product (so quantity is 1)
    const variantQuantities = [
        {
            variantId: price.id,
            quantity: 1,
        },
    ];

    logger.info(
        {
            entity: input.config.attachedTable,
            priceId: price.id,
        },
        `Creating checkout session...`,
    );

    try {
        // call the payment gateway to create the checkout session
        return await billingHandler.createCheckoutSession({
            config: input.config,
            price,
            returnUrl: input.returnUrl,
            customerEmail: user?.email ?? undefined,
            variantQuantities,
            enableDiscount: product.enableDiscount,
        });
    } catch (error) {
        logger.error(
            {
                error,
                entity: input.config.attachedTable,
            },
            `Error creating the checkout session`,
        );

        throw new Error(`Checkout not created`);
    }
}
