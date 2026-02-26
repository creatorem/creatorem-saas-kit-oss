import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

/**
 * @name native Used in the src/native folder
 * @description Get the keys for the native environment
 */
export const nativeSupabaseClientEnvs = () =>
    createEnv({
        clientPrefix: 'EXPO_PUBLIC_',
        client: {
            /**
             * 📡 API URL - Your Supabase project endpoint
             * Get from: Supabase Dashboard > Settings > API > Project URL
             * 
             * @default "http://127.0.0.1:54321" for local dev purpose only
             */
            EXPO_PUBLIC_SUPABASE_API_URL: z.string().url(),
            /**
             * 🔑 ANON KEY - Public key for client-side auth (safe to expose)
             * Get from: Supabase Dashboard > Settings > API > anon public
             * 
             * @default "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" for local dev purpose only
             */
            EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
        },
        runtimeEnv: {
            EXPO_PUBLIC_SUPABASE_API_URL: process.env.EXPO_PUBLIC_SUPABASE_API_URL,
            EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        },
        emptyStringAsUndefined: true,
    })

/**
 * @name www Used in the src/www folder
 * @description Get the keys for the web environment
 */
export const wwwSupabaseClientEnvs = () =>
    createEnv({
        clientPrefix: 'NEXT_PUBLIC_',
        client: {
            /**
             * 📡 API URL - Your Supabase project endpoint
             * Get from: Supabase Dashboard > Settings > API > Project URL
             * 
             * @default "http://127.0.0.1:54321" for local dev purpose only
             */
            NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
            /**
             * 🔑 ANON KEY - Public key for client-side auth (safe to expose)
             * Get from: Supabase Dashboard > Settings > API > anon public
             * 
             * @default "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" for local dev purpose only
             */
            NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
        },
        runtimeEnv: {
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        emptyStringAsUndefined: true,
    })

export const envs = {
    /**
     * @name native Used in the src/native folder
     * @description Get the keys for the native environment
     */
    native: nativeSupabaseClientEnvs,

    /**
     * @name www Used in the src/www folder
     * @description Get the keys for the web environment
     */
    www: wwwSupabaseClientEnvs,
};
