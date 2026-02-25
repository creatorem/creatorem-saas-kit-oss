import { Database } from '@kit/db';
import { SupabaseClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { getMfaMutationKey } from '../supabase-mutation-keys';
import { useSupabase } from './use-supabase';

export function useAuthFactorsList(userId: string, supabase?: SupabaseClient<Database>) {
    const webClient = useSupabase();
    const client = supabase ?? webClient;
    if (!client) {
        throw new Error(
            'Supabase client is not initialized. You must not have set the NEXT_PUBLIC_SUPABASE_... keys in your environment variables.',
        );
    }
    const queryKey = getMfaMutationKey(userId);

    const queryFn = async () => {
        const { data, error } = await client.auth.mfa.listFactors();

        if (error) {
            throw error;
        }

        return data;
    };

    return useQuery({
        queryKey,
        queryFn,
        staleTime: 0,
    });
}
