import { AppClient } from '@kit/db';
import { tableSchemaMap } from '@kit/drizzle';
import { applyServerAsyncFilter } from '@kit/utils/filters/server';
import { and, gte, lte, SQL } from 'drizzle-orm';
import z from 'zod';
import { AnalyticsFetcherData } from '../shared/components/analytics/analytics-fetcher';

const getConditions = async (
    contentType: keyof typeof tableSchemaMap,
    startDate?: string,
    endDate?: string,
    where?: Record<string, any>,
): Promise<SQL[]> => {
    if (where && contentType in where) {
        return where[contentType] as SQL[];
    }

    const whereConditions = await applyServerAsyncFilter('server_add_where_conditions_fetching_content_types', [], {
        contentType,
    });

    const schema = tableSchemaMap[contentType];

    if (startDate) {
        whereConditions.push(gte(schema.createdAt, startDate));
    }

    if (endDate) {
        whereConditions.push(lte(schema.createdAt, endDate));
    }

    return whereConditions;
};

export const analyticsFetcherSchema = z.object({
    contentTypes: z.array(
        z.enum(
            Object.keys(tableSchemaMap) as unknown as readonly [
                keyof typeof tableSchemaMap,
                ...(keyof typeof tableSchemaMap)[],
            ],
        ),
    ),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    // Optional where object passed from client; server interprets it if provided
    where: z.record(z.any()).optional(),
});

export const fetchAnalytics = async (
    db: AppClient,
    { contentTypes, startDate, endDate, where }: z.infer<typeof analyticsFetcherSchema>,
) => {
    const data = await db.rls.transaction(async (tx) => {
        const data: Partial<AnalyticsFetcherData<typeof contentTypes>> = {};

        for (const contentType of contentTypes) {
            // Build where conditions dynamically
            const whereConditions: SQL[] = await getConditions(contentType, startDate, endDate, where);
            // @ts-expect-error
            data[contentType] =
                whereConditions.length > 0
                    ? await tx
                          .select()
                          .from(tableSchemaMap[contentType])
                          .where(and(...whereConditions))
                          .orderBy(tableSchemaMap[contentType].createdAt)
                    : await tx
                          .select()
                          .from(tableSchemaMap[contentType])
                          .orderBy(tableSchemaMap[contentType].createdAt);
        }

        return data as AnalyticsFetcherData<typeof contentTypes>;
    });

    return data;
};
