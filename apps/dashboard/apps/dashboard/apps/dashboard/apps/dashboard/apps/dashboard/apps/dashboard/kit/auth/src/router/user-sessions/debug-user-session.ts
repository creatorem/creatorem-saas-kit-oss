import { AppClient } from '@kit/db';
import { logger } from '@kit/utils';
import { z } from 'zod';

export const debugUserSessionSchema = z.object({});

export async function debugUserSessionAction(input: z.infer<typeof debugUserSessionSchema>, { db }: { db: AppClient }) {
    const { data: debugInfo, error } = await db.supabase.schema('kit').rpc('debug_jwt_info');

    if (error) {
        logger.error({ error }, 'Failed to get debug info');
        throw new Error('Failed to get debug info');
    }

    return { debug: debugInfo?.[0] || null, message: 'Debug information for session detection' };
}
