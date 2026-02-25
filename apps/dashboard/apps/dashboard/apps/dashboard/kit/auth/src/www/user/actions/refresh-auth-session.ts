'use server';

import { authActionClient } from '@kit/auth/www/next';

export const refreshAuthSession = authActionClient
    .metadata({ actionName: 'refreshAuthSession' })
    .action(async ({ ctx: { db } }) => {
        await db.supabase.auth.refreshSession();
        return {};
    });
