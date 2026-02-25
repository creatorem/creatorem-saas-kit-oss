'use client';

import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
import {
    EnhancedDataTable,
    EnhancedDataTableColumnHeader,
    EnhancedDataTableColumnOptionsHeader,
    EnhancedDataTablePagination,
} from '@kit/ui/enhanced-data-table';
import { ScrollArea } from '@kit/ui/scroll-area';
import { cn } from '@kit/utils';
import {
    ColumnDef,
    ColumnFiltersState,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    type Row,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BaseEntity, ContentTableProps } from '../../../shared/types';
import { ContentTableActionsCell } from './content-table-actions-cell';
import { ContentTableBulkActionsWithPremadeHandlers } from './content-table-bulk-actions';
import { ContentTableEmptyState } from './content-table-empty-state';

export function ContentTable<T extends BaseEntity>({
    disableScroll = false,
    contentType,
    data,
    columns,
    searchPlaceholder,
    filters = [],
    icon,
    bulkActions = [],
    emptyStateTitle,
    emptyStateDescription,
    onRowClick,
    className,
    pageSize = 20,
    dataTablePaginationClassName,
    scrollAreaClassName,
    newItemLink,
    totalCount,
    currentPage,
    clientTrpc,
}: ContentTableProps<T>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Determine if we're using server-side pagination
    const isServerSidePagination = totalCount !== undefined && currentPage !== undefined;

    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);

    // For server-side pagination, sync with URL params
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: isServerSidePagination ? currentPage - 1 : 0,
        pageSize,
    });

    // Update pagination when URL changes (for server-side pagination)
    useEffect(() => {
        if (isServerSidePagination && currentPage) {
            setPagination((prev) => ({
                ...prev,
                pageIndex: currentPage - 1,
            }));
        }
    }, [currentPage, isServerSidePagination]);

    const tableColumns = useMemo(() => {
        const baseColumns: ColumnDef<T>[] = [
            {
                id: 'select',
                size: 64,
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                        className="border-border bg-background data-[state=checked]:border-primary mx-auto flex items-center justify-center border-2 shadow-none"
                        onClick={(e) => e.stopPropagation()}
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => {
                            row.toggleSelected(!!value);
                        }}
                        aria-label="Select row"
                        className="border-border bg-background data-[state=checked]:border-primary mx-auto flex items-center justify-center border-2 shadow-none"
                        onClick={(e) => {
                            e.stopPropagation();
                            const isShiftClick = e.shiftKey;
                            const isSelected = row.getIsSelected();

                            if (isShiftClick) {
                                const rowModel = table.getRowModel();
                                const selectedIds = table.getSelectedRowModel().rows.map((row) => row.index);

                                // Range selection with shift+click
                                const start = Math.min(...selectedIds, row.index);
                                const end = Math.max(...selectedIds, row.index);
                                const newSelection: Record<string, boolean> = { ...rowSelection };

                                for (let i = start; i <= end; i++) {
                                    const targetRow = rowModel.rows[i];
                                    if (targetRow) {
                                        if (!isSelected) {
                                            newSelection[targetRow.id] = true;
                                        } else {
                                            delete newSelection[targetRow.id];
                                        }
                                    }
                                }

                                setRowSelection(newSelection);
                            }
                        }}
                    />
                ),
                meta: {
                    headerClassName: 'sticky left-0 z-10',
                    cellClassName: 'sticky left-0 z-10',
                },
                enableSorting: false,
                enableHiding: false,
            },
        ];

        const dataColumns = columns.map((col) => ({
            ...col,
            header:
                typeof col.header === 'string'
                    ? ({ column }: any) => (
                          <EnhancedDataTableColumnHeader column={column} title={col.header as string} />
                      )
                    : col.header,
        })) as ColumnDef<T>[];

        const actionsColumn: ColumnDef<T> = {
            id: 'actions',
            size: 64,
            header: ({ table }) => <EnhancedDataTableColumnOptionsHeader table={table} />,
            cell: ({ row }) => <ContentTableActionsCell row={row} contentType={contentType} clientTrpc={clientTrpc} />,
        };

        return [...baseColumns, ...dataColumns, actionsColumn];
    }, [columns]);

    // Handle pagination changes for server-side pagination
    const handlePaginationChange = useCallback(
        (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
            const newPagination = typeof updater === 'function' ? updater(pagination) : updater;

            if (isServerSidePagination) {
                // Update URL for server-side pagination without full page reload
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', String(newPagination.pageIndex + 1));
                params.set('pageSize', String(newPagination.pageSize));

                // Use replace to avoid adding to browser history
                router.replace(`${pathname}?${params.toString()}`);
            }

            setPagination(newPagination);
        },
        [isServerSidePagination, pagination, pathname, router, searchParams],
    );

    const table = useReactTable({
        data,
        columns: tableColumns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        defaultColumn: {
            minSize: 0,
            size: 0,
        },
        // For server-side pagination, provide manual row count
        ...(isServerSidePagination && {
            pageCount: Math.ceil((totalCount || 0) / pageSize),
            manualPagination: true,
        }),
        autoResetPageIndex: false,
        getRowId: (row) => row.id,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: handlePaginationChange,
        enableRowSelection: true,
    });

    const hasSelectedRows = useMemo(() => {
        return Object.keys(rowSelection).length > 0;
    }, [rowSelection]);

    const handleRowClicked = useCallback(
        (row: Row<T>) => {
            if (onRowClick) {
                onRowClick(row.original);
            }
        },
        [onRowClick],
    );

    if (data.length === 0) {
        return (
            <ContentTableEmptyState
                title={emptyStateTitle || `No ${contentType}s found`}
                description={emptyStateDescription || `Create your first ${contentType} to get started.`}
                newItemLink={newItemLink}
                icon={icon}
                action={
                    newItemLink ? (
                        <Button variant="outline" aria-label={`New ${contentType}`}>
                            New {contentType}
                        </Button>
                    ) : null
                }
            />
        );
    }

    const totalEntries = totalCount ? totalCount : data.length;

    const paginationAndBulkActions = (
        <>
            <EnhancedDataTablePagination
                table={table}
                totalEntries={totalEntries}
                className={cn('h-(--content-table-pagination-height)', dataTablePaginationClassName)}
            />
            {hasSelectedRows && (
                <ContentTableBulkActionsWithPremadeHandlers
                    table={table}
                    actions={bulkActions}
                    contentType={contentType}
                    clientTrpc={clientTrpc}
                />
            )}
        </>
    );

    return (
        <div
            className={cn(
                // 'relative flex h-full flex-col [--content-table-pagination-height:57px]',
                'relative flex h-full flex-col',
                className,
            )}
        >
            {disableScroll ? (
                <>
                    {/* break sticky position of the header row */}
                    <div className="no-scrollbar h-full w-full overflow-x-auto">
                        <EnhancedDataTable<T>
                            wrapperClassName="overflow-visible"
                            fixedHeader
                            table={table}
                            onRowClicked={handleRowClicked}
                        />
                    </div>
                    {paginationAndBulkActions}
                </>
            ) : (
                <ScrollArea
                    orientation="both"
                    className={cn(
                        // 'h-[calc(100%-var(--content-table-pagination-height))]',
                        'h-full',
                        scrollAreaClassName,
                    )}
                    // scrollBarClassName="pb-(--content-table-pagination-height) pt-10"
                    scrollBarClassName="pt-10"
                >
                    <EnhancedDataTable<T>
                        wrapperClassName="overflow-visible"
                        fixedHeader
                        table={table}
                        onRowClicked={handleRowClicked}
                    />
                    {paginationAndBulkActions}
                </ScrollArea>
            )}
        </div>
    );
}
