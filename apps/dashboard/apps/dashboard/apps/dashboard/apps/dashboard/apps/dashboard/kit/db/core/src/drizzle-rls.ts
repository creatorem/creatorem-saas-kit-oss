import { sql } from 'drizzle-orm';
import { PgDatabase } from 'drizzle-orm/pg-core';

type SupabaseToken = {
    iss?: string;
    sub?: string;
    aud?: string[] | string;
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
    role?: string;
};

export function createRLSDrizzle<
    Database extends PgDatabase<any, any, any>,
    Token extends SupabaseToken = SupabaseToken,
>(token: Token, rls: Database) {
    return {
        transaction: ((transaction, config) => {
            return rls.transaction(async (tx) => {
                // Supabase exposes auth.uid() and auth.jwt()
                // https://supabase.com/docs/guides/database/postgres/row-level-security#helper-functions
                try {
                    // Set up Supabase auth context
                    await tx.execute(sql`
                  select set_config('request.jwt.claims', '${sql.raw(JSON.stringify(token))}', TRUE);
                  select set_config('request.jwt.claim.sub', '${sql.raw(token.sub ?? '')}', TRUE);
                  set local role ${sql.raw(token.role ?? 'anon')};
                `);

                    return await transaction(tx);
                } finally {
                    // Clean up
                    await tx.execute(sql`
                  select set_config('request.jwt.claims', NULL, TRUE);
                  select set_config('request.jwt.claim.sub', NULL, TRUE);
                  reset role;
                `);
                }
            }, config);
        }) as typeof rls.transaction,
    };
}
