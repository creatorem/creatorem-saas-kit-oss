import 'client-only';

import { createTrpcQueryClient } from '@creatorem/next-trpc/query-client';
import type { AppRouter } from '@kit/shared/types/router';
import { getSupabaseClient } from '@kit/supabase-client';
import { useQuery } from '@tanstack/react-query';
import { envs } from '~/envs';

const url = `${envs().NEXT_PUBLIC_DASHBOARD_URL}/api/trpc`;

export const clientTrpc = createTrpcQueryClient<AppRouter>({
    url,
    headers: async () => {
        const supabase = getSupabaseClient();
        const jwt = (await supabase.auth.getSession()).data.session?.access_token;
        if (!jwt) return {} as HeadersInit;

        return {
            Authorization: `Bearer ${jwt!}`,
        };
    },
    useQuery,
});
