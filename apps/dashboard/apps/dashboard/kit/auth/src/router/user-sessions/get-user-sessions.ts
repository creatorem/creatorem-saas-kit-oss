import { AppClient } from '@kit/db';
import { logger } from '@kit/utils';
import { z } from 'zod';

export const getUserSessionsSchema = z.object({});

export const userSessionSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    factor_id: z.string().nullable(),
    aal: z.string(),
    not_after: z.string().nullable(),
    user_agent: z.string().nullable(),
    ip: z.string().nullable(),
});

export type UserSession = z.infer<typeof userSessionSchema>;

export async function getUserSessionsAction(input: z.infer<typeof getUserSessionsSchema>, { db }: { db: AppClient }) {
    const { data: sessions, error } = await db.supabase.schema('kit').rpc('get_user_sessions');

    if (error) {
        logger.error({ error }, 'Failed to fetch user sessions');
        throw new Error('Failed to fetch sessions');
    }

    const parsedSessions = userSessionSchema.array().parse(sessions || []);

    return { sessions: parsedSessions };
}
