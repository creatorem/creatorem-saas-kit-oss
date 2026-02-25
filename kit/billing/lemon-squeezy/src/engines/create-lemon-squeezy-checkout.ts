import type { createCheckoutSessionSchema } from '@kit/billing-types/schema';
import { envs } from '@kit/lemon-squeezy/envs';
import { createCheckout, getCustomer, NewCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { z } from 'zod';
import { initializeLemonSqueezyClient } from './lemon-squeezy-client';

/**
 * Creates a checkout for a Lemon Squeezy product.
 */
export async function createLemonSqueezyCheckout({
    attachedEntityId,
    config,
    price,
    customerId,
    returnUrl,
    ...params
}: z.infer<typeof createCheckoutSessionSchema>) {
    await initializeLemonSqueezyClient();

    const storeId = Number(envs().LEMON_SQUEEZY_STORE_ID);
    const variantId = Number(price.id);

    const customer = customerId ? await getCustomer(customerId) : null;

    let customerEmail = params.customerEmail;

    // if we can find an existing customer using the ID,
    // we use the email from the customer object so that we can
    // link the previous subscription to this one
    // otherwise it will create a new customer if another email is provided (ex. a different team member)
    if (customer?.data) {
        customerEmail = customer.data.data.attributes.email;
    }

    const newCheckout: NewCheckout = {
        checkoutOptions: {
            embed: config.checkoutUI === 'embedded',
            media: true,
            logo: true,
            discount: params.enableDiscount ?? false,
            buttonColor: config.checkout?.submit?.color?.background,
            buttonTextColor: config.checkout?.submit?.color?.text,
        },
        checkoutData: {
            email: customerEmail,
            variantQuantities: params.variantQuantities.map((item) => {
                return {
                    quantity: item.quantity,
                    variantId: Number(item.variantId),
                };
            }),
            custom: {
                attachedEntityId,
            },
        },
        productOptions: {
            redirectUrl: returnUrl,
            // only show the selected variant ID
            enabledVariants: [variantId],
            confirmationButtonText: config.checkout?.submit?.text,
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        preview: true,
        testMode: process.env.NODE_ENV !== 'production',
    };

    return createCheckout(storeId, variantId, newCheckout);
}
