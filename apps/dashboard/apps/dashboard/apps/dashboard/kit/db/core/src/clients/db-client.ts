import { type DrizzleDB } from '@kit/drizzle';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '../database.types';

export const createRequirer = <T>(getter: () => Promise<T>, errorMessage: string) => {
    return async () => {
        const value = await getter();
        if (!value) {
            throw new Error(errorMessage);
        }
        return value;
    };
};

export abstract class DBClient {
    public client: {
        rls: Pick<DrizzleDB, 'transaction'>;
        supabase: ReturnType<typeof createServerClient<Database>>;
    };

    constructor(client: {
        rls: Pick<DrizzleDB, 'transaction'>;
        supabase: ReturnType<typeof createServerClient<Database>>;
    }) {
        this.client = client;
    }
}
