import { getSupabaseClient as getNativeClient } from './native/client';
import { getSupabaseClient as getWebClient } from './www/client';

export const getSupabaseClient = () => {
    if (typeof process.env.EXPO_PUBLIC_SUPABASE_API_URL) {
        return getNativeClient();
    }
    if (typeof process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return getWebClient();
    }

    throw new Error('Both EXPO_PUBLIC_SUPABASE_API_URL and NEXT_PUBLIC_SUPABASE_URL are undefined.');
};
