import { z } from 'zod';

export const retrieveCheckoutSessionSchema = z.object({
    sessionId: z.string(),
});
