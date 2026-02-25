import { z } from 'zod';

export const createBillingPortalSessionSchema = z.object({
    returnUrl: z.string().url(),
});
