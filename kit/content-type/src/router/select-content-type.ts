import { AppClient } from '@kit/db';
import { tableSchemaMap } from '@kit/drizzle';
import { eq } from 'drizzle-orm';
import z from 'zod';

export const selectSingleContentTypeSchema = z.object({
    contentType: z.enum(
        Object.keys(tableSchemaMap) as unknown as readonly [
            keyof typeof tableSchemaMap,
            ...(keyof typeof tableSchemaMap)[],
        ],
    ),
    id: z.string().uuid('ID must be a valid UUID'),
});

export const selectSingleContentTypeAction = async (
    { contentType, id }: z.infer<typeof selectSingleContentTypeSchema>,
    { db }: { db: AppClient },
) => {
    try {
        const table = tableSchemaMap[contentType];

        const result = await db.rls.transaction(async (tx) => {
            const results = await tx.select().from(table).where(eq(table.id, id)).limit(1);

            return results[0] || null;
        });

        return result;
    } catch (error) {
        console.error('Error getting content type:', error);
        return {
            serverError: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
};

export const selectContentTypesSchema = z.object({
    contentType: z.enum(
        Object.keys(tableSchemaMap) as unknown as readonly [
            keyof typeof tableSchemaMap,
            ...(keyof typeof tableSchemaMap)[],
        ],
    ),
    limit: z.number().optional(),
});

export const selectContentTypesAction = async (
    { contentType, limit = 10 }: z.infer<typeof selectContentTypesSchema>,
    { db }: { db: AppClient },
) => {
    try {
        const table = tableSchemaMap[contentType];

        const result = await db.rls.transaction(async (tx) => {
            return await tx.select().from(table).limit(limit);
        });

        return result;
    } catch (error) {
        console.error('Error getting content type:', error);
        return {
            serverError: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
};
