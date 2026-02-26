import { Database } from '@kit/db';
import type { SupabaseClient, UserAttributes } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import { SupabaseMutationKeys } from '../supabase-mutation-keys';
import { useSupabase } from './use-supabase';

type Params = UserAttributes & { redirectTo: string };

const mutationKey = SupabaseMutationKeys.SUPABASE_USER;

export function useAuthUserUpdater(supabase?: SupabaseClient<Database>) {
    const hookClient = useSupabase();
    const client = supabase ?? hookClient;
    if (!client) {
        throw new Error(
            'Supabase client is not initialized. You must not have set the NEXT_PUBLIC_SUPABASE_... keys in your environment variables.',
        );
    }

    const mutationFn = async (attributes: Params) => {
        const { redirectTo, ...params } = attributes;

        const response = await client.auth.updateUser(params, {
            emailRedirectTo: redirectTo,
        });

        if (response.error) {
            throw response.error;
        }

        return response.data;
    };

    return useMutation({
        mutationKey,
        mutationFn,
    });
}
