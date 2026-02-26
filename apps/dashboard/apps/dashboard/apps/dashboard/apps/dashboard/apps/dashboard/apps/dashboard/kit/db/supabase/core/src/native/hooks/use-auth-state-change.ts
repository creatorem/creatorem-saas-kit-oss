import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSupabase } from '../../hooks/use-supabase';
import { SupabaseMutationKeys } from '../../supabase-mutation-keys';

export function useAuthStateChange({
    appHomePath,
    onEvent,
}: {
    appHomePath: string;
    onEvent?: (event: AuthChangeEvent, user: Session | null) => void;
}) {
    const client = useSupabase();
    const queryClient = useQueryClient();

    useEffect(() => {
        const listener = client.auth.onAuthStateChange((event, user) => {
            if (onEvent) {
                onEvent(event, user);
            }

            if (event === 'SIGNED_OUT') {
                queryClient.setQueryData(SupabaseMutationKeys.SUPABASE_USER, null);
            }
        });

        return () => {
            listener.data.subscription.unsubscribe();
        };
    }, [client.auth, appHomePath, onEvent, queryClient]);
}
