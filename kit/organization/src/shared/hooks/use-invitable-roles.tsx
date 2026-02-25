import { useZodForm } from '@kit/utils/hooks/use-zod-form';
import { z } from 'zod';
import { useOrganization } from '../context';

// Form schema that only includes fields present in the form
const invitationFormSchema = z.object({
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
        message: 'Role ID is required',
    }),
});

export type InvitationFormData = z.infer<typeof invitationFormSchema>;

export const useInvitableRoles = ({ userRoleHierarchyLevel }: { userRoleHierarchyLevel?: number }) => {
    // Get organization and roles from context
    const { organization, organizationRoles, member } = useOrganization();

    // Use user's hierarchy level from context if not provided via props
    const effectiveUserHierarchyLevel = userRoleHierarchyLevel ?? member.roleHierarchyLevel;

    // Filter and sort roles based on user permissions
    // Sort from highest hierarchy value (least important) to lowest (most important)
    const invitableRoles = organizationRoles
        .filter((role) => {
            if (member.isOwner) return true;
            // If user hierarchy level is undefined or not provided, allow all roles
            if (typeof effectiveUserHierarchyLevel !== 'number') {
                return true;
            }
            // Users can only invite people to roles with hierarchy level equal or lower than theirs
            // Basic users (level 1) can only invite to level 1 roles
            return role.hierarchyLevel <= effectiveUserHierarchyLevel;
        })
        .sort((a, b) => b.hierarchyLevel - a.hierarchyLevel); // Sort descending: highest hierarchy value first (least important)

    const form = useZodForm({
        schema: invitationFormSchema,
        mode: 'onChange',
        defaultValues: {
            email: '',
            roleId: invitableRoles && invitableRoles.length > 0 ? invitableRoles[0]?.id || '' : '',
        },
    });

    return {
        invitableRoles,
        form,
    };
};
