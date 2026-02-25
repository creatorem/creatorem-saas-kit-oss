import { type User, user as userTable } from '@kit/drizzle';
import { eq } from 'drizzle-orm';
import { createRequirer, DBClient } from './db-client';

export class UserDBClient extends DBClient {
    /**
     * Get the current user from the database
     * @returns The current user or null if the user is not found
     */
    public get = async (): Promise<User | null> => {
        const {
            data: { user: authUser },
        } = await this.client.supabase.auth.getUser();

        if (!authUser) {
            return null;
        }

        const userData = await this.client.rls.transaction(async (tx) => {
            const userData = await tx.select().from(userTable).where(eq(userTable.authUserId, authUser.id));
            return userData;
        });

        if (userData.length === 0) {
            return null;
        }

        if (userData.length > 1) {
            throw new Error('Multiple users found for the same auth user');
        }

        return userData[0] ?? null;
    };

    public require = createRequirer(this.get, 'User not found');
}
