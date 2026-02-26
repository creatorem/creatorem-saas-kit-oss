'server-only';

import { getDrizzleSupabaseClient } from '@kit/db';
import { headers } from 'next/headers';
import { getSupabaseServerClient } from './get-supabase-server-client';

const getDBClientWithJwt = async (jwt: string) => {
    // Create client with JWT authentication
    const supabaseClient = getSupabaseServerClient(jwt);

    // Set the session manually for RLS to work properly
    try {
        const { data: user } = await supabaseClient.auth.getUser(jwt);

        if (user.user) {
            // Set session with the JWT
            await supabaseClient.auth.setSession({
                access_token: jwt,
                refresh_token: '', // Not needed for this use case
            });
        }
    } catch (error) {
        console.error('Failed to set session:', error);
    }

    return await getDrizzleSupabaseClient(supabaseClient, jwt);
};

export const getDBClient = async (jwt?: string) => {
    if (!jwt) {
        const headersList = await headers();
        const bearer = headersList.get('Authorization');
        const bearerJwt = bearer?.replace('Bearer ', '');

        if (bearerJwt) {
            return await getDBClientWithJwt(bearerJwt);
        }

        const supabaseClient = getSupabaseServerClient();
        return await getDrizzleSupabaseClient(supabaseClient);
    }
    return await getDBClientWithJwt(jwt);
};
