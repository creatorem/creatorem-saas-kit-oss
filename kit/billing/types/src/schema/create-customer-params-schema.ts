import { z } from 'zod';

export const createCustomerParamsSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    metadata: z.record(z.string(), z.string()).optional(),
});
