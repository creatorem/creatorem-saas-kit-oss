import { AppClient } from '@kit/db';
import { getSupabaseServerAdminClient } from '@kit/supabase-server';
import { logger } from '@kit/utils';

export const deleteUserAction = async ({ db }: { db: AppClient }) => {
    console.log('deleteUserAction');
    const user = await db.user.require();
    console.log(user);

    try {
        // Delete the user from auth
        const supabase = getSupabaseServerAdminClient();

        const deleteAuthResult = await supabase.auth.admin.deleteUser(user.id);
        console.log({ deleteAuthResult });

        if (deleteAuthResult.error) {
            logger.error(
                {
                    userId: user.id,
                    error: deleteAuthResult.error,
                    action: 'delete-user',
                },
                'Failed to delete user from auth',
            );
            throw new Error('Failed to delete user authentication');
        }
        console.log('before sign out');

        // Sign the user out
        await db.supabase.auth.signOut();

        logger.info(
            {
                userId: user.id,
                action: 'delete-user',
            },
            'User successfully deleted',
        );

        return { success: true };
    } catch (error) {
        logger.error(
            {
                userId: user.id,
                error,
                action: 'delete-user',
            },
            'Error deleting user account',
        );

        throw new Error('Failed to delete account');
    }
};
