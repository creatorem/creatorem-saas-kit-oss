import { AppClient } from '@kit/db';
import { eq, user } from '@kit/drizzle';
import z from 'zod';

export const updateUserSchema = z.object({
    userImageUrl: z
        .string({
            invalid_type_error: 'Image must be a string.',
        })
        .optional()
        .nullable(),
    userName: z
        .string({
            required_error: 'Name is required.',
            invalid_type_error: 'Name must be a string.',
        })
        .trim()
        .min(1, 'Name is required.')
        .max(64, 'Maximum 64 characters allowed.'),
    userPhone: z
        .string({
            invalid_type_error: 'Phone must be a string.',
        })
        .trim()
        .max(16, 'Maximum 16 characters allowed.')
        .optional()
        .or(z.literal('')),
});

export const updateUserAction = async (
    { userImageUrl, userName, userPhone }: z.infer<typeof updateUserSchema>,
    { db }: { db: AppClient },
) => {
    try {
        const currentUser = await db.user.require();

        // Start a transaction to ensure all operations succeed or fail together
        await db.rls.transaction(async (tx) => {
            await tx
                .update(user)
                .set({
                    completedOnboarding: true,
                    name: userName,
                    phone: userPhone,
                    profileUrl: userImageUrl,
                })
                .where(eq(user.id, currentUser.id));
        });
    } catch (error) {
        console.error('Error completing onboarding:', error);
        return {
            serverError: 'Failed to complete onboarding',
        };
    }
};
