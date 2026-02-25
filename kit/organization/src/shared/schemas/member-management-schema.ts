import { z } from 'zod';

export const inviteMemberSchema = z.object({
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
    organizationId: z.string().uuid(),
    organizationName: z.string().min(1, 'Organization name is required'),
});

export const updateMemberRoleSchema = z.object({
    memberId: z.string().uuid(),
    roleId: z.string().uuid({
        message: 'Role ID is required and must be a valid UUID',
    }),
    organizationId: z.string().uuid(),
});

export const removeMemberSchema = z.object({
    memberId: z.string().uuid(),
    organizationId: z.string().uuid(),
});

export const getOrganizationMembersSchema = z.object({
    organizationId: z.string().uuid(),
});

export type InviteMemberSchema = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleSchema = z.infer<typeof updateMemberRoleSchema>;
export type RemoveMemberSchema = z.infer<typeof removeMemberSchema>;
export type GetOrganizationMembersSchema = z.infer<typeof getOrganizationMembersSchema>;
