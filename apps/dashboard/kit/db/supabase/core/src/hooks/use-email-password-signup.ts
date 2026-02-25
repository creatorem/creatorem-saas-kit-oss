import { Database } from '@kit/db';
import { SupabaseClient } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import { SupabaseMutationKeys } from '../supabase-mutation-keys';
import { useSupabase } from './use-supabase';

interface EmailPasswordSignUpInput {
    email: string;
    password: string;
    emailRedirectTo: string;
    captchaToken?: string;
}

export interface SignUpWithEmailAndPasswordParams {
    onError?: () => void;
    supabase?: SupabaseClient<Database>;
}

export function useEmailPasswordSignUp(props: SignUpWithEmailAndPasswordParams = {}) {
    const webClient = useSupabase();
    const client = props.supabase ?? webClient;
    if (!client) {
        throw new Error(
            'Supabase client is not initialized. You must not have set the NEXT_PUBLIC_SUPABASE_... keys in your environment variables.',
        );
    }
    const mutationKey = SupabaseMutationKeys.AUTH_SIGN_UP_EMAIL_PASSWORD;

    const mutationFn = async (params: EmailPasswordSignUpInput) => {
        const { emailRedirectTo, captchaToken, ...credentials } = params;

        const response = await client.auth.signUp({
            ...credentials,
            options: {
                emailRedirectTo,
                captchaToken,
            },
        });

        if (response.error) {
            throw response.error.message;
        }

        const user = response.data?.user;
        const identities = user?.identities ?? [];

        if (identities.length === 0) {
            throw new Error('This email is already used with an existing account.');
        }

        return response.data;
    };

    return useMutation({
        mutationKey,
        mutationFn,
        onError: props.onError,
    });
}
