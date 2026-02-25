import { z } from 'zod';

export const stripeServerEnvSchema = z.object({
    secretKey: z.string().min(1),
    webhooksSecret: z.string().min(1),
});
