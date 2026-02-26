import { Database } from '@kit/db';
import { SupabaseClient } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import { SupabaseMutationKeys } from '../supabase-mutation-keys';
import { useSupabase } from './use-supabase';

interface RequestPasswordResetMutationParams {
    email: string;
    redirectTo: string;
    captchaToken?: string;
}

export function useForgottenPasswordEmailSender(supabase?: SupabaseClient<Database>) {
    const webClient = useSupabase();
    const client = supabase ?? webClient;
    if (!client) {
        throw new Error(
            'Supabase client is not initialized. You must not have set the NEXT_PUBLIC_SUPABASE_... keys in your environment variables.',
        );
    }
    const mutationKey = SupabaseMutationKeys.AUTH_RESET_PASSWORD;

    const mutationFn = async (params: RequestPasswordResetMutationParams) => {
        const { error, data } = await client.auth.resetPasswordForEmail(params.email, {
            redirectTo: params.redirectTo,
            captchaToken: params.captchaToken,
        });

        if (error) {
            throw error;
        }

        return data;
    };

    return useMutation({
        mutationFn,
        mutationKey,
    });
}
