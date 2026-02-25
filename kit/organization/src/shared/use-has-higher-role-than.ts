'use client';

import { useSupabase } from '@kit/supabase';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useOrganization } from './context';

export const useHasHigherRoleThan = ({ memberId }: { memberId: string }) => {
    const supabase = useSupabase();
    const { organization } = useOrganization();

    const queryKey = ['hasHigherRoleThan', organization.id, memberId];

    const queryFn = useCallback(async () => {
        if (!organization.id || !memberId) {
            return false;
        }

        // Try using just the function name without schema prefix
        const { data, error } = await supabase.schema('kit').rpc('user_org_role_is_higher_than', {
            org_id: organization.id,
            target_user_id: memberId,
        });

        if (error) {
            console.error('Failed to check role hierarchy:', error);
            throw error;
        }

        return data || false;
    }, [supabase, organization.id, memberId]);

    return useQuery({
        queryFn,
        queryKey,
        enabled: !!organization.id && !!memberId,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    });
};
