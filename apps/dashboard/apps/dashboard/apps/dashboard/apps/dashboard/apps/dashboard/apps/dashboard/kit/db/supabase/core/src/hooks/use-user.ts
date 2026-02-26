import { Database } from '@kit/db';
import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { SupabaseMutationKeys } from '../supabase-mutation-keys';
import { useSupabase } from './use-supabase';

export function useUser(
    initialData?: ({ supabase: SupabaseUser } & Database['public']['Tables']['user']['Row']) | null,
    supabase?: SupabaseClient<Database>,
) {
    const hookClient = useSupabase();
    const client = (supabase ?? hookClient) as unknown as SupabaseClient<Database, 'public'>;
    if (!client) {
        throw new Error(
            'Supabase client is not initialized. You must not have set the NEXT_PUBLIC_SUPABASE_... keys in your environment variables.',
        );
    }

    const queryFn = useCallback(async () => {
        const response = await client.auth.getUser();

        // this is most likely a session error or the user is not logged in
        if (response.error) {
            return null;
        }

        if (!response.data?.user) {
            return Promise.reject(new Error('Unexpected result format'));
        }

        // Ensure table queries are typed against the public schema
        const user = await client
            .schema('public')
            .from('user')
            .select('*')
            .eq('auth_user_id', response.data.user.id)
            .single();

        if (!user || user.error || !user.data) {
            return Promise.reject(new Error('Unexpected result format'));
        }

        const dbUser = user.data;
        return { supabase: response.data.user, ...dbUser };
    }, [client]);

    return useQuery({
        queryFn,
        queryKey: SupabaseMutationKeys.SUPABASE_USER,
        initialData,
        refetchInterval: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
}
