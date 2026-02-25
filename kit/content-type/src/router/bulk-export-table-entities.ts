import { Buffer } from 'node:buffer';
import { AppClient } from '@kit/db';
import { inArray, tableSchemaMap } from '@kit/drizzle';
import { logger } from '@kit/utils';
import ExcelJS from 'exceljs';
import { z } from 'zod';

export const bulkExportTableEntitiesSchema = z.object({
    entityIds: z.array(z.string().min(1, 'Entity ID is required')).min(1, 'At least one entity ID is required'),
    entitySlug: z.enum(
        Object.keys(tableSchemaMap) as unknown as readonly [
            keyof typeof tableSchemaMap,
            ...(keyof typeof tableSchemaMap)[],
        ],
    ),
    format: z.enum(['csv', 'excel', 'json']).default('csv'),
    columns: z.array(z.string()).optional(), // Optional columns to include in export
});

export async function bulkExportTableEntitiesAction(
    { entityIds, entitySlug, format, columns }: z.infer<typeof bulkExportTableEntitiesSchema>,
    { db }: { db: AppClient },
) {
    const user = await db.user.require();

    try {
        if (!tableSchemaMap[entitySlug]) {
            throw new Error(`Invalid entity type: ${entitySlug}`);
        }

        const tableSchema = tableSchemaMap[entitySlug];

        const entities = await db.rls.transaction(async (tx) => {
            if (columns && columns.length > 0) {
                const columnSchema = z
                    .enum(Object.keys(tableSchemaMap[entitySlug]) as unknown as readonly [string, ...string[]])
                    .array();
                const parsedColumns = columnSchema.parse(columns);
                return await tx
                    .select(parsedColumns as any)
                    .from(tableSchema)
                    .where(inArray(tableSchema.id, entityIds));
            } else {
                return await tx.select().from(tableSchema).where(inArray(tableSchema.id, entityIds));
            }
        });

        if (entities.length === 0) {
            throw new Error(`No entities found for export`);
        }

        let fileContent: string | Buffer;
        let fileName: string;
        let mimeType: string;

        if (format === 'csv') {
            fileContent = generateCSV(entities, columns);
            fileName = `${entitySlug}-export-${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
        } else if (format === 'json') {
            fileContent = generateJSON(entities, columns);
            fileName = `${entitySlug}-export-${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
        } else {
            fileContent = await generateExcel(entities, columns);
            fileName = `${entitySlug}-export-${new Date().toISOString().split('T')[0]}.xlsx`;
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }

        logger.info(
            {
                userId: user.id,
                entityIds,
                entitySlug,
                format,
                exportedCount: entities.length,
                action: 'export-table-entities',
            },
            'Entities successfully exported',
        );

        const fileContentBase64 =
            typeof fileContent === 'string'
                ? Buffer.from(fileContent, 'utf8').toString('base64')
                : fileContent.toString('base64');

        return {
            success: true,
            exportedCount: entities.length,
            fileName,
            mimeType,
            fileContent: fileContentBase64, // Base64 encode for transfer
            message: `Successfully exported ${entities.length} ${entitySlug} entities to ${format.toUpperCase()}`,
        };
    } catch (error) {
        logger.error(
            {
                userId: user.id,
                entityIds,
                entitySlug,
                format,
                error,
                action: 'export-table-entities',
            },
            'Error exporting entities',
        );

        throw new Error(`Failed to export ${entitySlug} entities`);
    }
}

// Helper function to generate CSV content
function generateCSV(entities: any[], columns?: string[]): string {
    if (entities.length === 0) return '';

    // Determine which columns to export
    const exportColumns = columns || Object.keys(entities[0]);

    // Create CSV header
    const header = exportColumns.map((col) => `"${col}"`).join(',');

    // Create CSV rows
    const rows = entities.map((entity) => {
        return exportColumns
            .map((col) => {
                const value = entity[col as keyof typeof entity];
                // Handle different data types and escape quotes
                if (value === null || value === undefined) {
                    return '""';
                }
                if (typeof value === 'object') {
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                }
                return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(',');
    });

    return [header, ...rows].join('\n');
}

// Helper function to generate JSON content
function generateJSON(entities: any[], columns?: string[]): string {
    if (entities.length === 0) return '[]';

    // Determine which columns to export
    const exportColumns = columns || Object.keys(entities[0]);

    // Filter entities to only include specified columns
    const filteredEntities = entities.map((entity) => {
        const filteredEntity: Record<string, any> = {};
        exportColumns.forEach((col) => {
            filteredEntity[col] = entity[col as keyof typeof entity];
        });
        return filteredEntity;
    });

    // Return formatted JSON with 2-space indentation
    return JSON.stringify(filteredEntities, null, 2);
}

// Helper function to generate Excel content using ExcelJS
async function generateExcel(entities: any[], columns?: string[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Export');

    if (entities.length === 0) {
        const empty = await workbook.xlsx.writeBuffer();
        return Buffer.isBuffer(empty) ? empty : Buffer.from(empty as ArrayBuffer);
    }

    // Determine which columns to export
    const exportColumns = columns || Object.keys(entities[0]);

    // Add headers
    const headerRow = worksheet.addRow(exportColumns);
    headerRow.font = { bold: true };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data rows
    entities.forEach((entity) => {
        const rowData = exportColumns.map((col) => {
            const value = entity[col as keyof typeof entity];
            if (value === null || value === undefined) {
                return '';
            }
            if (typeof value === 'object') {
                return JSON.stringify(value);
            }
            return value;
        });
        worksheet.addRow(rowData);
    });

    // Auto-fit columns
    exportColumns.forEach((col, index) => {
        const column = worksheet.getColumn(index + 1);
        const columnName = col;
        const maxLength = Math.max(
            columnName.length,
            ...entities.map((entity) => {
                const value = entity[col as keyof typeof entity];
                return value ? String(value).length : 0;
            }),
        );
        column.width = maxLength + 2;
    });

    const output = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(output) ? output : Buffer.from(output as ArrayBuffer);
}
