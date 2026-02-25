import { z } from 'zod';

export const revokeInvitationSchema = z.object({
    organizationId: z.string().min(1, 'Organization ID is required'),
    organizationName: z.string().min(1, 'Organization name is required'),
    id: z
        .string({
            required_error: 'Id is required.',
            invalid_type_error: 'Id must be a string.',
        })
        .trim()
        .uuid('Id is invalid.')
        .min(1, 'Id is required.')
        .max(36, 'Maximum 36 characters allowed.'),
});

export type RevokeInvitationSchema = z.infer<typeof revokeInvitationSchema>;
