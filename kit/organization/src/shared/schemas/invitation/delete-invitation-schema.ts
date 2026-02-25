import { z } from 'zod';

export const declineInvitationSchema = z.object({
    id: z
        .string({
            required_error: 'Id is required.',
            invalid_type_error: 'Id must be a string.',
        })
        .trim()
        .uuid('Id is invalid.')
        .min(1, 'Id is required.')
        .max(36, 'Maximum 36 characters allowed.'),
    organizationId: z.string().min(1, 'Organization ID is required'),
});

export type DeleteInvitationSchema = z.infer<typeof declineInvitationSchema>;
