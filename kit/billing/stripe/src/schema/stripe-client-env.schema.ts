import { z } from 'zod';

export const stripeClientEnvSchema = z.object({
    publishableKey: z.string().min(1),
});
