import { Product } from '@kit/drizzle';
import { z } from 'zod';

/**
 * Filter operator types based on Drizzle ORM operators
 * See: https://orm.drizzle.team/docs/operators
 */
const filterOperatorSchema = z.enum([
    'eq', // equals
    'ne', // not equals
    'gt', // greater than
    'gte', // greater than or equal
    'lt', // less than
    'lte', // less than or equal
    'like', // pattern matching (case-sensitive)
    'ilike', // pattern matching (case-insensitive)
    'inArray', // value in array
    'notInArray', // value not in array
    'isNull', // is null
    'isNotNull', // is not null
    'between', // between two values
]);

export type FilterOperator = z.infer<typeof filterOperatorSchema>;

/**
 * Column filter schema - allows filtering on any product column
 */
const columnFilterSchema = z.object({
    column: z
        .enum(['id', 'name', 'description', 'imageUrl', 'price', 'currency', 'createdAt', 'updatedAt'])
        .describe('The column to filter on'),
    operator: filterOperatorSchema.describe('The comparison operator to use'),
    value: z
        .union([z.string(), z.number(), z.array(z.union([z.string(), z.number()])), z.null()])
        .optional()
        .describe('The value to compare against. Not required for isNull/isNotNull operators'),
    value2: z.union([z.string(), z.number()]).optional().describe('Second value for between operator'),
});

export type ColumnFilter = z.infer<typeof columnFilterSchema>;

/**
 * Sort direction
 */
const sortDirectionSchema = z.enum(['asc', 'desc']).default('desc');

/**
 * Sort configuration
 */
const sortSchema = z.object({
    column: z
        .enum(['id', 'name', 'description', 'price', 'currency', 'createdAt', 'updatedAt'])
        .default('createdAt')
        .describe('Column to sort by'),
    direction: sortDirectionSchema.describe('Sort direction (ascending or descending)'),
});

export type Sort = z.infer<typeof sortSchema>;

/**
 * Select products input schema
 * Allows flexible filtering, sorting, and pagination
 */
export const selectProductsArgsSchema = z.object({
    filters: z
        .array(columnFilterSchema)
        .optional()
        .describe('Array of filters to apply. Multiple filters are combined with AND logic'),
    sort: sortSchema.optional().describe('Sorting configuration'),
    limit: z.number().min(1).max(100).default(10).describe('Maximum number of products to return (1-100)'),
    offset: z.number().min(0).default(0).describe('Number of products to skip for pagination'),
});

export type SelectProductsArgs = z.infer<typeof selectProductsArgsSchema>;

/**
 * Select products result
 */
export type SelectProductsResult = {
    type: 'tool_result';
    success: boolean;
    data?: {
        products: Product[];
        count: number;
        hasMore: boolean;
    };
    error?: string;
};
