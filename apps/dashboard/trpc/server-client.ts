import 'server-only';

import { createTrpcClient } from '@creatorem/next-trpc/client';
import type { AppRouter } from '@kit/shared/types/router';
import { getSupabaseServerClient } from '@kit/supabase-server';
import { cookies } from 'next/headers';
import { envs } from '~/envs';

const url = `${envs().NEXT_PUBLIC_DASHBOARD_URL}/api/trpc`;

export const serverTrpc = createTrpcClient<AppRouter>({
    url,
    headers: async () => {
        const supabase = getSupabaseServerClient();
        const jwt = (await supabase.auth.getSession()).data.session?.access_token;

        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();

        const headers: HeadersInit = {
            cookie: cookieHeader,
        };

        if (jwt) {
            headers.Authorization = `Bearer ${jwt}`;
        }

        return headers;
    },
});
