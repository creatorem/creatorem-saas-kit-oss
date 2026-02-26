import { endpoint } from '@creatorem/next-trpc';
import {
    and,
    asc,
    between,
    count,
    desc,
    eq,
    gt,
    gte,
    ilike,
    inArray,
    isNotNull,
    isNull,
    like,
    lt,
    lte,
    ne,
    notInArray,
    product,
    SQL,
} from '@kit/drizzle';
import { logger } from '@kit/utils';
import z from 'zod';
import { type ColumnFilter, selectProductsArgsSchema } from '../lib/select-products-type';
import { ctx } from './router.ctx';

/**
 * Helper function to get column reference safely
 */
function getColumnRef(column: string): any {
    const columnMap: Record<string, any> = {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        price: product.price,
        currency: product.currency,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    };
    return columnMap[column];
}

/**
 * Helper function to build a filter condition based on operator
 */
function buildFilterCondition(filter: ColumnFilter): SQL | undefined {
    const { column, operator, value, value2 } = filter;
    const columnRef = getColumnRef(column);

    if (!columnRef) {
        logger.warn({ column }, 'Invalid column name for filter');
        return undefined;
    }

    switch (operator) {
        case 'eq':
            return value !== undefined ? eq(columnRef, value as any) : undefined;
        case 'ne':
            return value !== undefined ? ne(columnRef, value as any) : undefined;
        case 'gt':
            return value !== undefined ? gt(columnRef, value as any) : undefined;
        case 'gte':
            return value !== undefined ? gte(columnRef, value as any) : undefined;
        case 'lt':
            return value !== undefined ? lt(columnRef, value as any) : undefined;
        case 'lte':
            return value !== undefined ? lte(columnRef, value as any) : undefined;
        case 'like':
            return value !== undefined ? like(columnRef, value as string) : undefined;
        case 'ilike':
            return value !== undefined ? ilike(columnRef, value as string) : undefined;
        case 'inArray':
            return Array.isArray(value) ? inArray(columnRef, value as any[]) : undefined;
        case 'notInArray':
            return Array.isArray(value) ? notInArray(columnRef, value as any[]) : undefined;
        case 'isNull':
            return isNull(columnRef);
        case 'isNotNull':
            return isNotNull(columnRef);
        case 'between':
            return value !== undefined && value2 !== undefined
                ? between(columnRef, value as any, value2 as any)
                : undefined;
        default:
            logger.warn({ operator }, 'Unsupported filter operator');
            return undefined;
    }
}

export const productRouter = ctx.router({
    archiveProducts: endpoint
        .input(
            z.object({
                page: z.coerce.number(),
                pageSize: z.coerce.number(),
                orgId: z.string(),
            }),
        )
        .action(async ({ page, pageSize, orgId }, { db }) => {
            const offset = (page - 1) * pageSize;

            const [productsData, totalCountResult] = await db.rls.transaction(async (tx) => {
                const products = await tx
                    .select()
                    .from(product)
                    .where(eq(product.organizationId, orgId))
                    .limit(pageSize)
                    .offset(offset)
                    .orderBy(desc(product.createdAt));

                const totalCountResult = await tx.select({ count: count() }).from(product);

                return [products, totalCountResult];
            });

            const totalCount = totalCountResult[0]?.count || 0;

            return {
                productsData,
                totalCount,
            };
        }),
    singleProduct: endpoint
        .input(
            z.object({
                id: z.string(),
            }),
        )
        .action(async ({ id }, { db }) => {
            const productData = await db.rls.transaction(async (tx) => {
                const result = await tx.select().from(product).where(eq(product.id, id));
                return result[0];
            });

            return productData;
        }),
    createProduct: endpoint
        .input(
            z.object({
                data: z.object({
                    name: z.string(),
                    description: z.string().optional(),
                    imageUrl: z.string().optional(),
                    price: z.string(),
                    currency: z.string().optional(),
                }),
                orgId: z.string(),
            }),
        )
        .action(async ({ orgId, data }, { db }) => {
            try {
                const productData = {
                    organizationId: orgId,
                    name: data.name,
                    description: data.description,
                    imageUrl: data.imageUrl,
                    price: data.price,
                    currency: data.currency || 'USD',
                };

                const [response] = await db.rls.transaction(async (tx) => {
                    return await tx
                        .insert(product)
                        .values(productData as any)
                        .returning();
                });

                logger.info({ productData }, 'Product created successfully');
                return response;
            } catch (error) {
                logger.error({ error, data }, 'Failed to create product');
                throw new Error('Failed to create product');
            }
        }),
    updateProduct: endpoint
        .input(
            z.object({
                productId: z.string(),
                data: z.object({
                    name: z.string(),
                    description: z.string().optional(),
                    imageUrl: z.string().optional(),
                    price: z.string(),
                    currency: z.string().optional(),
                }),
            }),
        )
        .action(async ({ data: updateData, productId }, { db }) => {
            try {
                const filteredData = Object.fromEntries(
                    Object.entries(updateData).filter(([_, value]) => value !== undefined),
                );

                await db.rls.transaction(async (tx) => {
                    await tx.update(product).set(filteredData).where(eq(product.id, productId));
                });

                logger.info({ productId, updateData }, 'Product updated successfully');
                return { success: true };
            } catch (error) {
                logger.error({ error, productId, updateData }, 'Failed to update product');
                return { success: false, error: 'Failed to update product' };
            }
        }),
    selectProducts: endpoint
        .input(
            z.object({
                args: selectProductsArgsSchema,
                orgId: z.string(),
            }),
        )
        .action(async ({ orgId, args }, { db }) => {
            try {
                // Build filter conditions
                const filterConditions: (SQL | undefined)[] = [eq(product.organizationId, orgId)];

                if (args.filters && args.filters.length > 0) {
                    for (const filter of args.filters) {
                        const condition = buildFilterCondition(filter);
                        if (condition) {
                            filterConditions.push(condition);
                        }
                    }
                }

                // Combine all filters with AND
                const whereClause =
                    filterConditions.length > 0
                        ? and(...filterConditions.filter((c): c is SQL => c !== undefined))
                        : undefined;

                // Build sort order
                const sortColumn = args.sort?.column || 'createdAt';
                const sortDirection = args.sort?.direction || 'desc';
                const sortColumnRef = getColumnRef(sortColumn);
                const orderBy = sortDirection === 'asc' ? asc(sortColumnRef) : desc(sortColumnRef);

                // Execute query
                const results = await db.rls.transaction(async (tx) => {
                    const query = tx
                        .select()
                        .from(product)
                        .where(whereClause)
                        .orderBy(orderBy)
                        .limit(args.limit || 10)
                        .offset(args.offset || 0);

                    return await query;
                });

                logger.info(
                    {
                        organizationId: orgId,
                        filters: args.filters,
                        resultCount: results.length,
                    },
                    'Products selected successfully',
                );

                return {
                    products: results,
                    count: results.length,
                    hasMore: results.length === (args.limit || 10),
                };
            } catch (error) {
                logger.error({ error, args }, 'Failed to select products');
                throw new Error('Failed to select products');
            }
        }),
});
