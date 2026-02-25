import { AppClient } from '@kit/db';
import { tableSchemaMap } from '@kit/drizzle';
import { count, ilike, or, SQL, sql } from 'drizzle-orm';
import z from 'zod';

export const searchContentTypeSchema = z.object({
    contentTypes: z.array(
        z.enum(
            Object.keys(tableSchemaMap) as unknown as readonly [
                keyof typeof tableSchemaMap,
                ...(keyof typeof tableSchemaMap)[],
            ],
        ),
    ),
    query: z.string().min(1, 'Query must be at least 1 characters'),
    limit: z.number().optional().default(10),
    offsets: z
        .record(
            z.enum(
                Object.keys(tableSchemaMap) as unknown as readonly [
                    keyof typeof tableSchemaMap,
                    ...(keyof typeof tableSchemaMap)[],
                ],
            ),
            z.number(),
        )
        .optional(),
    searchColumns: z.record(
        z.enum(
            Object.keys(tableSchemaMap) as unknown as readonly [
                keyof typeof tableSchemaMap,
                ...(keyof typeof tableSchemaMap)[],
            ],
        ),
        z.string().array(),
    ),
});

export const searchContentTypeAction = async (
    { contentTypes, query, limit, searchColumns, offsets }: z.infer<typeof searchContentTypeSchema>,
    { db }: { db: AppClient },
) => {
    try {
        const startedAt = Date.now();
        // console.log('enter search content type action');
        // console.log({ contentTypes, query, limit, searchColumns, offsets });

        type AllResults = {
            [LocalKey in (typeof contentTypes)[number]]: (typeof tableSchemaMap)[LocalKey]['$inferSelect'][];
        };

        const allResults: AllResults = contentTypes.reduce((acc, contentType) => {
            acc[contentType] = [];
            return acc;
        }, {} as AllResults);

        if (!searchColumns || Object.keys(searchColumns).length === 0) {
            // console.log('no search columns');
            const searchTimeMs = Date.now() - startedAt;
            return {
                results: allResults,
                meta: {
                    totalEntries: 0,
                    searchTimeMs,
                    hasMore: {} as Record<string, boolean>,
                    totalByType: {} as Record<string, number>,
                },
            };
        }

        let totalEntries = 0;
        const hasMore: Record<string, boolean> = {};
        const totalByType: Record<string, number> = {};

        for (const contentType of contentTypes) {
            allResults[contentType] = [];

            const searchCol = searchColumns[contentType];

            if (!searchCol) {
                hasMore[contentType] = false;
                totalByType[contentType] = 0;
                continue;
            }

            const searchColumnsSchema = z
                .enum(Object.keys(tableSchemaMap[contentType]) as unknown as readonly [string, ...string[]])
                .array();
            const parsedSearchColumns = searchColumnsSchema.parse(searchCol);
            // console.log({ parsedSearchColumns });

            const table = tableSchemaMap[contentType];

            // Build search conditions for string columns
            const searchConditions: SQL[] = [];

            const columns = Object.keys(table);
            for (const col of parsedSearchColumns) {
                if (columns.includes(col)) {
                    // console.log({ col });
                    // Cast column to text to safely apply ILIKE across uuid/timestamp/numeric types
                    // @ts-expect-error
                    searchConditions.push(ilike(sql`${table[col]}::text`, `%${query}%`));
                }
            }

            if (searchConditions.length === 0) {
                console.log('no search conditions');
                hasMore[contentType] = false;
                totalByType[contentType] = 0;
                continue;
            }

            const offset = offsets?.[contentType] ?? 0;

            const ctResults = await db.rls.transaction(async (tx) => {
                const whereExpr = or(...searchConditions);

                const [items, totalCountResult] = await Promise.all([
                    tx.select().from(table).where(whereExpr).limit(limit).offset(offset),
                    tx.select({ count: count() }).from(table).where(whereExpr),
                ]);

                const totalForType = totalCountResult?.[0]?.count ?? 0;
                totalEntries += Number(totalForType);
                totalByType[contentType] = Number(totalForType);
                hasMore[contentType] = offset + items.length < Number(totalForType);

                return items;
            });
            console.log(`enter ctResults for contentType: ${contentType}`);
            console.log({ ctResults });

            // @ts-expect-error
            allResults[contentType] = ctResults;
        }

        // console.log({ allResults });

        const searchTimeMs = Date.now() - startedAt;

        return {
            results: allResults,
            meta: {
                totalEntries,
                searchTimeMs,
                hasMore,
                totalByType,
            },
        };
    } catch (error) {
        console.error('Error searching content type:', error);
        return {
            serverError: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
};
