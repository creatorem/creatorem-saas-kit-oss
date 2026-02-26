import { getSupabaseClient } from '@kit/supabase-client';
import { useMemo } from 'react';

export function useSupabase() {
    return useMemo(() => getSupabaseClient(), []);
}
