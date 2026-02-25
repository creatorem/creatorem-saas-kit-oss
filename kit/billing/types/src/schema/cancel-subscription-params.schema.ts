import { z } from 'zod';

export const cancelSubscriptionParamsSchema = z.object({
    subscriptionId: z.string(),
    invoiceNow: z.boolean().optional(),
});
