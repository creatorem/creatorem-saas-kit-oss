import { getDrizzleSupabaseClient } from '@kit/db';
import { getSupabaseServerClient } from '@kit/supabase-server';
import { actionClient } from '@kit/utils/next';

/**
 * Authenticated action client
 *
 * This client extends the base actionClient with authentication context.
 * It automatically provides access to the authenticated user's database connection.
 *
 * Usage:
 * ```typescript
 * const myAction = authActionClient
 *   .metadata({ actionName: 'myAction' })
 *   .schema(mySchema)
 *   .action(async ({ ctx: { db }, parsedInput }) => {
 *     // Access to authenticated user's db context
 *     const user = await db.user.require();
 *     // Your action logic here
 *   });
 * ```
 */
export const authActionClient = actionClient.use(async ({ next }) => {
    const supabaseClient = getSupabaseServerClient();
    const db = await getDrizzleSupabaseClient(supabaseClient);

    return next({ ctx: { db } });
});
