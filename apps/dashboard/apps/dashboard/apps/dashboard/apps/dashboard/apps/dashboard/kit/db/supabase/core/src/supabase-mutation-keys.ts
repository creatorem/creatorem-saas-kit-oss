/**
 * Mutation keys enable cache invalidation - same key allows mutations to refresh related queries.
 * Use same key across query/mutation pairs for automatic UI synchronization.
 */

export const SupabaseMutationKeys = {
    /** User data updates - use-auth-user-updater.ts */
    SUPABASE_USER: ['supabase:user'] as const,

    /** User registration - use-sign-up-with-email-password.ts */
    AUTH_SIGN_UP_EMAIL_PASSWORD: ['auth', 'sign-up-with-email-password'] as const,

    /** Email/password login - use-sign-in-with-email-password.ts */
    AUTH_SIGN_IN_EMAIL_PASSWORD: ['auth', 'sign-in-with-email-password'] as const,

    /** OAuth/social login - use-sign-in-with-provider.ts */
    AUTH_SIGN_IN_PROVIDER: ['auth', 'sign-in-with-provider'] as const,

    /** Password reset requests - use-request-reset-password.ts */
    AUTH_RESET_PASSWORD: ['auth', 'reset-password'] as const,

    /** MFA factors management - requires userId parameter */
    MFA_FACTORS: ['mfa-factors'] as const,
} as const;

/**
 * Creates MFA mutation key with user ID: ['mfa-factors', userId]
 */
export function getMfaMutationKey(userId: string): readonly [string, string] {
    return [...SupabaseMutationKeys.MFA_FACTORS, userId];
}

/** Type guard for Supabase mutation keys */
export function isSupabaseMutationKey(key: readonly unknown[], expectedKey: readonly unknown[]): boolean {
    return JSON.stringify(key) === JSON.stringify(expectedKey);
}

/** All possible Supabase mutation key types */
export type SupabaseMutationKey =
    | typeof SupabaseMutationKeys.SUPABASE_USER
    | typeof SupabaseMutationKeys.AUTH_SIGN_UP_EMAIL_PASSWORD
    | typeof SupabaseMutationKeys.AUTH_SIGN_IN_EMAIL_PASSWORD
    | typeof SupabaseMutationKeys.AUTH_SIGN_IN_PROVIDER
    | typeof SupabaseMutationKeys.AUTH_RESET_PASSWORD
    | [(typeof SupabaseMutationKeys.MFA_FACTORS)[0], string];
