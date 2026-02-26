import { Database } from '@kit/db';
import type { SignInWithOAuthCredentials, SupabaseClient } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import { SupabaseMutationKeys } from '../supabase-mutation-keys';
import { useSupabase } from './use-supabase';

export function useProviderSignInAndUp(supabase?: SupabaseClient<Database>) {
    const webClient = useSupabase();
    const client = supabase ?? webClient;
    const mutationKey = SupabaseMutationKeys.AUTH_SIGN_IN_PROVIDER;
    if (!client) {
        throw new Error(
            'Supabase client is not initialized. You must not have set the NEXT_PUBLIC_SUPABASE_... keys in your environment variables.',
        );
    }

    const mutationFn = async (credentials: SignInWithOAuthCredentials) => {
        const response = await client.auth.signInWithOAuth(credentials);

        if (response.error) {
            throw response.error.message;
        }

        return response.data;
    };

    return useMutation({
        mutationFn,
        mutationKey,
    });
}
