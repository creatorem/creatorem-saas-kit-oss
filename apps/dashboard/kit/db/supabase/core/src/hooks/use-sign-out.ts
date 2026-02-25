import { Database } from '@kit/db';
import { SupabaseClient } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseMutationKeys } from '../supabase-mutation-keys';
import { useSupabase } from './use-supabase';

export function useSignOut(supabase?: SupabaseClient<Database>) {
    const queryClient = useQueryClient();
    const webClient = useSupabase();
    const client = supabase ?? webClient;
    if (!client) {
        throw new Error(
            'Supabase client is not initialized. You must not have set the NEXT_PUBLIC_SUPABASE_... keys in your environment variables.',
        );
    }

    return useMutation({
        mutationFn: () => {
            return client.auth.signOut();
        },
        onSuccess: () => {
            return queryClient.refetchQueries({
                queryKey: SupabaseMutationKeys.SUPABASE_USER,
            });
        },
    });
}
