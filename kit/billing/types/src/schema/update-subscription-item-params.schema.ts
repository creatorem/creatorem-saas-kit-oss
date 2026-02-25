import { z } from 'zod';

export const updateSubscriptionItemParamsSchema = z.object({
    subscriptionId: z.string().min(1),
    subscriptionItemId: z.string().min(1),
    quantity: z.number().min(1),
});
