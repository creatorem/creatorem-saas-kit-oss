import { AppClient } from '@kit/db';
import { inArray, tableSchemaMap } from '@kit/drizzle';
import { logger } from '@kit/utils';
import z from 'zod';

export const bulkDeleteTableEntitiesSchema = z.object({
    entityIds: z.array(z.string().min(1, 'Entity ID is required')).min(1, 'At least one entity ID is required'),
    entitySlug: z.enum(
        Object.keys(tableSchemaMap) as unknown as readonly [
            keyof typeof tableSchemaMap,
            ...(keyof typeof tableSchemaMap)[],
        ],
    ),
});

export async function bulkDeleteTableEntitiesAction(
    { entityIds, entitySlug }: z.infer<typeof bulkDeleteTableEntitiesSchema>,
    { db }: { db: AppClient },
) {
    const user = await db.user.require();

    try {
        // Validate that the table name is safe to prevent SQL injection
        if (!tableSchemaMap[entitySlug]) {
            throw new Error(`Invalid entity type: ${entitySlug}`);
        }

        const tableSchema = tableSchemaMap[entitySlug];

        // Use the table schema for type-safe bulk deletion
        const result = await db.rls.transaction(async (tx) => {
            // First check if all entities exist and user has permission
            const existingEntities = await tx
                .select({ id: tableSchema.id })
                .from(tableSchema)
                .where(inArray(tableSchema.id, entityIds));

            if (existingEntities.length !== entityIds.length) {
                const existingIds = existingEntities.map((e) => e.id);
                const missingIds = entityIds.filter((id) => !existingIds.includes(id));
                throw new Error(`Some entities not found: ${missingIds.join(', ')}`);
            }

            // Delete all entities using the table schema
            const deleteResult = await tx.delete(tableSchema).where(inArray(tableSchema.id, entityIds));

            return deleteResult;
        });

        logger.info(
            {
                userId: user.id,
                entityIds,
                entitySlug,
                deletedCount: entityIds.length,
                action: 'delete-table-entities',
            },
            'Entities successfully deleted',
        );

        return {
            success: true,
            deletedCount: entityIds.length,
            result,
            message: `Successfully deleted ${entityIds.length} ${entitySlug} entities`,
        };
    } catch (error) {
        logger.error(
            {
                userId: user.id,
                entityIds,
                entitySlug,
                error,
                action: 'delete-table-entities',
            },
            'Error deleting entities',
        );

        throw new Error(`Failed to delete ${entitySlug} entities`);
    }
}
