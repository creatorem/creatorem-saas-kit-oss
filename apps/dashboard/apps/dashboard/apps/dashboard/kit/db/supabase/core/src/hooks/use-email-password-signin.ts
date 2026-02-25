import { Database } from '@kit/db';
import type { SignInWithPasswordCredentials, SupabaseClient } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseMutationKeys } from '../supabase-mutation-keys';
import { useSupabase } from './use-supabase';

export function useEmailPasswordSignIn(supabase?: SupabaseClient<Database>) {
    const webClient = useSupabase();
    const client = supabase ?? webClient;
    if (!client) {
        throw new Error(
            'Supabase client is not initialized. You must not have set the NEXT_PUBLIC_SUPABASE_... keys in your environment variables.',
        );
    }
    const mutationKey = SupabaseMutationKeys.AUTH_SIGN_IN_EMAIL_PASSWORD;

    const queryClient = useQueryClient();

    const mutationFn = async (credentials: SignInWithPasswordCredentials) => {
        const response = await client.auth.signInWithPassword(credentials);

        if (response.error) {
            throw response.error.message;
        }

        const user = response.data?.user;
        const identities = user?.identities ?? [];

        if (identities.length === 0) {
            throw new Error('User already registered');
        }

        return response.data;
    };

    return useMutation({
        mutationKey,
        mutationFn,
        onSuccess: () => {
            return queryClient.refetchQueries({
                queryKey: ['supabase:user'],
            });
        },
    });
}
