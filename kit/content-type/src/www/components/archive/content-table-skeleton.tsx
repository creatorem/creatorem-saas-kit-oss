import { Skeleton } from '@kit/ui/skeleton';
import { cn } from '@kit/utils';
import type { ColumnDef } from '@tanstack/react-table';
import type { BaseEntity } from '../../../shared/types';

interface ContentTableSkeletonProps<T extends BaseEntity> {
    columns: ColumnDef<T>[];
    rowCount?: number;
    className?: string;
    scrollAreaClassName?: string;
    dataTablePaginationClassName?: string;
}

export function ContentTableSkeleton<T extends BaseEntity>({
    columns,
    rowCount = 10,
    className,
    scrollAreaClassName,
    dataTablePaginationClassName,
}: ContentTableSkeletonProps<T>) {
    // Create skeleton columns that match the original structure
    const baseColumns = [
        {
            id: 'select',
            size: 64,
            header: () => (
                <div className="flex items-center justify-center">
                    <Skeleton className="h-4 w-4" />
                </div>
            ),
            cell: () => (
                <div className="flex items-center justify-center">
                    <Skeleton className="h-4 w-4" />
                </div>
            ),
        },
    ];

    const dataColumns = columns.map((col) => ({
        id: col.id,
        size: col.size || 150,
        header: () => (
            <div className="flex items-center">
                <Skeleton className="h-4 w-20" />
            </div>
        ),
        cell: () => {
            // Create different skeleton patterns based on common column types
            const columnId = col.id?.toString().toLowerCase() || '';

            if (columnId.includes('name') || columnId.includes('title')) {
                return (
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                );
            }

            if (columnId.includes('email')) {
                return (
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28" />
                    </div>
                );
            }

            if (columnId.includes('date') || columnId.includes('time')) {
                return (
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                );
            }

            if (columnId.includes('status') || columnId.includes('type')) {
                return <Skeleton className="h-6 w-16 rounded-full" />;
            }

            if (columnId.includes('price') || columnId.includes('amount')) {
                return (
                    <div className="space-y-1 text-right">
                        <Skeleton className="ml-auto h-4 w-16" />
                        <Skeleton className="ml-auto h-3 w-12" />
                    </div>
                );
            }

            if (columnId.includes('location')) {
                return (
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                );
            }

            // Default skeleton for other columns
            return <Skeleton className="h-4 w-20" />;
        },
    }));

    const actionsColumn = {
        id: 'actions',
        size: 64,
        header: () => (
            <div className="flex items-center justify-center">
                <Skeleton className="h-4 w-4" />
            </div>
        ),
        cell: () => (
            <div className="flex items-center justify-center">
                <Skeleton className="h-8 w-8 rounded" />
            </div>
        ),
    };

    const skeletonColumns = [...baseColumns, ...dataColumns, actionsColumn];

    // Generate skeleton rows
    const skeletonRows = Array.from({ length: rowCount }, (_, index) => ({
        id: `skeleton-${index}`,
        original: {} as T,
    }));

    return (
        <div className={cn('relative flex flex-col', className)}>
            <div className={cn('relative w-full overflow-auto', scrollAreaClassName)}>
                {/* Table Header */}
                <div className="bg-background border-b">
                    <div className="flex">
                        {skeletonColumns.map((column) => (
                            <div
                                key={column.id}
                                className="text-muted-foreground flex items-center px-4 py-3 text-left text-sm font-medium"
                                style={{ width: column.size }}
                            >
                                {column.header()}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table Body */}
                <div className="divide-y">
                    {skeletonRows.map((row) => (
                        <div key={row.id} className="hover:bg-muted/50 flex">
                            {skeletonColumns.map((column) => (
                                <div
                                    key={`${row.id}-${column.id}`}
                                    className="flex items-center px-4 py-3 text-sm"
                                    style={{ width: column.size }}
                                >
                                    {column.cell()}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination Skeleton */}
            <div className={cn('flex items-center justify-between border-t px-2 py-4', dataTablePaginationClassName)}>
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-16" />
                    <span className="text-muted-foreground text-sm">of</span>
                    <Skeleton className="h-8 w-16" />
                </div>
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    );
}
