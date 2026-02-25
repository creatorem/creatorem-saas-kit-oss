import { z } from 'zod';

import { billingConfigSchema } from '../create-billing-schema';

export const createCheckoutSessionSchema = z.object({
    config: billingConfigSchema,
    returnUrl: z.string().url(),
    price: z.any(),
    customerEmail: z.string().email().optional(),
    enableDiscount: z.boolean().optional(),
    variantQuantities: z.array(
        z.object({
            variantId: z.string().min(1),
            quantity: z.number(),
        }),
    ),
    attachedEntityId: z.string().uuid().nullable(),
    customerId: z.string().nullable(),
    metadata: z.record(z.string()).optional(),
});
