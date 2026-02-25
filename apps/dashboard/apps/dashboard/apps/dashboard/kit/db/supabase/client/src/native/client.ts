import { Database } from '@kit/db';
import { envs } from '@kit/supabase-client/envs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { LargeSecureStore } from './large-secure-store';

const storage = Platform.OS === 'web' ? AsyncStorage : new LargeSecureStore();

// Memoize the Supabase client to prevent creating multiple connections
let clientInstance: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabaseClient = () => {
    // Return existing client if already created
    if (clientInstance) {
        return clientInstance;
    }

    // Create and cache the client instance
    clientInstance = createClient<Database>(
        envs.native().EXPO_PUBLIC_SUPABASE_API_URL,
        envs.native().EXPO_PUBLIC_SUPABASE_ANON_KEY,
        {
            auth: {
                storage,
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: false,
            },
        },
    );

    return clientInstance;
};
