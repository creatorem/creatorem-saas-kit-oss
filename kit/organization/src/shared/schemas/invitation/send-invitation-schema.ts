import { z } from 'zod';

export const sendInvitationSchema = z.object({
    email: z
        .string({
            required_error: 'Email is required.',
            invalid_type_error: 'Email must be a string.',
        })
        .trim()
        .min(1, 'Email is required.')
        .max(255, 'Maximum 255 characters allowed.')
        .email('Enter a valid email address.'),
    roleId: z.string().uuid({
        message: 'Role ID is required and must be a valid UUID',
    }),
    organizationId: z.string().uuid('Organization ID is required'),
    organizationName: z.string().min(1, 'Organization name is required'),
});

export type SendInvitationSchema = z.infer<typeof sendInvitationSchema>;
