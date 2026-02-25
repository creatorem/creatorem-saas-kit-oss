'use client';

import { Icon } from '@kit/ui/icon';
import { cn } from '@kit/utils';
import { Column, flexRender, Table as ReactTable, Row } from '@tanstack/react-table';
import * as React from 'react';
import { Badge } from '../shadcn/badge';
import { Button } from '../shadcn/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '../shadcn/command';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../shadcn/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../shadcn/popover';
import { ScrollArea } from '../shadcn/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shadcn/select';
import { Separator } from '../shadcn/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../shadcn/table';

type EnhancedDataTableProps<TData> = React.ComponentPropsWithoutRef<typeof Table> & {
    table: ReactTable<TData>;
    fixedHeader?: boolean;
    onRowClicked?: (row: Row<TData>) => void;
};

function EnhancedDataTable<TData>({
    table,
    fixedHeader,
    onRowClicked,
    ...other
}: EnhancedDataTableProps<TData>): React.JSX.Element {
    const visibleColumns = table.getAllColumns().filter((c) => c.getIsVisible()).length;
    const helperColumns = table
        .getAllColumns()
        .filter((c) => (c.id === 'select' || c.id === 'actions') && c.getIsVisible()).length;
    const flexColumns = visibleColumns - helperColumns;

    const renderTableHeader = () => (
        <TableHeader className={cn(fixedHeader && 'bg-background sticky top-0 z-20 shadow-xs')}>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="!border-b">
                    {headerGroup.headers.map((header) => {
                        const headerClassName = (header.column.columnDef.meta as any)?.headerClassName;
                        return (
                            <TableHead
                                key={header.id}
                                className={cn(headerClassName)}
                                style={{
                                    width:
                                        header.column.getSize() !== 0
                                            ? header.column.getSize()
                                            : `${100 / flexColumns}%`,
                                    minWidth:
                                        header.column.getSize() !== 0
                                            ? header.column.getSize()
                                            : `${100 / flexColumns}%`,
                                }}
                            >
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                        );
                    })}
                </TableRow>
            ))}
        </TableHeader>
    );

    const renderTableBody = () => {
        const rows = table.getRowModel().rows;

        if (!rows?.length) {
            return (
                <TableBody>
                    <TableRow className="!bg-transparent last:border-b-0">
                        <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                            <div className="text-muted-foreground text-sm">No results.</div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            );
        }

        return (
            <TableBody>
                {rows.map((row) => (
                    <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className={cn('last:border-b-0', onRowClicked && 'cursor-pointer')}
                        onClick={() => onRowClicked?.(row)}
                    >
                        {row.getVisibleCells().map((cell) => {
                            const cellClassName = (cell.column.columnDef.meta as any)?.cellClassName;
                            return (
                                <TableCell key={cell.id} className={cn(cellClassName)}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            );
                        })}
                    </TableRow>
                ))}
            </TableBody>
        );
    };

    return (
        <Table {...other}>
            {renderTableHeader()}
            {renderTableBody()}
        </Table>
    );
}

EnhancedDataTable.displayName = 'EnhancedDataTable';

type EnhancedDataTableColumnHeaderProps<TData, TValue> = React.HTMLAttributes<HTMLDivElement> & {
    column: Column<TData, TValue>;
    title: string;
};

function EnhancedDataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
}: EnhancedDataTableColumnHeaderProps<TData, TValue>) {
    // If column can't be sorted or hidden, just show the title
    if (!column.getCanSort() && !column.getCanHide()) {
        return <div className={cn(className)}>{title}</div>;
    }

    const renderSortIcon = () => {
        if (column.getIsSorted() === 'desc') {
            return <Icon name="ArrowDown" className="ml-2 size-4 shrink-0" />;
        }
        if (column.getIsSorted() === 'asc') {
            return <Icon name="ArrowUp" className="ml-2 size-4 shrink-0" />;
        }
        return <Icon name="ArrowUpDown" className="ml-2 size-4 shrink-0" />;
    };

    const renderSortOptions = () => (
        <>
            <DropdownMenuItem className="cursor-pointer" onClick={() => column.toggleSorting(false)}>
                <Icon name="ArrowUp" className="text-muted-foreground/70 mr-2 size-3.5" />
                Sort ascending
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => column.toggleSorting(true)}>
                <Icon name="ArrowDown" className="text-muted-foreground/70 mr-2 size-3.5" />
                Sort descending
            </DropdownMenuItem>
        </>
    );

    const renderHideOption = () => (
        <DropdownMenuItem className="cursor-pointer" onClick={() => column.toggleVisibility(false)}>
            <Icon name="EyeOff" className="text-muted-foreground/70 mr-2 size-3.5" />
            Hide column
        </DropdownMenuItem>
    );

    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        aria-label="Sort"
                        variant="ghost"
                        size="sm"
                        className="data-[state=open]:bg-accent -ml-3 h-8 text-sm"
                    >
                        <span>{title}</span>
                        {renderSortIcon()}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {column.getCanSort() && renderSortOptions()}
                    {column.getCanSort() && column.getCanHide() && <DropdownMenuSeparator />}
                    {column.getCanHide() && renderHideOption()}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

EnhancedDataTableColumnHeader.displayName = 'EnhancedDataTableColumnHeader';

type EnhancedDataTableColumnOptionsHeaderProps<TData> = {
    table: ReactTable<TData>;
};

function EnhancedDataTableColumnOptionsHeader<TData>({ table }: EnhancedDataTableColumnOptionsHeaderProps<TData>) {
    const visibleColumns = table
        .getAllColumns()
        .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide());

    const getColumnTitle = (column: Column<TData, unknown>) => {
        const meta = column.columnDef.meta as { title?: string };
        return meta?.title ?? column.columnDef.id;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    aria-label="Column options"
                    type="button"
                    variant="ghost"
                    className="data-[state=open]:bg-muted mr-4 ml-auto flex size-8"
                >
                    <Icon name="Settings2" className="size-4 shrink-0" />
                    <span className="sr-only">Column options</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
                <DropdownMenuLabel>Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {visibleColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                        {getColumnTitle(column)}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

EnhancedDataTableColumnOptionsHeader.displayName = 'EnhancedDataTableColumnOptionsHeader';

type EnhancedDataTablePaginationProps<TData> = {
    table: ReactTable<TData>;
    pageSizeOptions?: number[];
    className?: string;
    totalEntries?: number;
};

function EnhancedDataTablePagination<TData>({
    table,
    pageSizeOptions = [10, 20, 30, 40, 50],
    className,
    totalEntries,
}: EnhancedDataTablePaginationProps<TData>) {
    const currentPage = table.getState().pagination.pageIndex + 1;
    const totalPages = table.getPageCount();
    const pageSize = table.getState().pagination.pageSize;

    const renderPageSizeSelector = () => (
        <div className="flex items-center gap-2">
            <Select value={`${pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
                <SelectTrigger className="h-8 w-16">
                    <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                    {pageSizeOptions.map((size) => (
                        <SelectItem key={size} value={`${size}`}>
                            {size}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-sm font-medium whitespace-nowrap">
                <span className="hidden sm:inline">rows per page</span>
                <span className="sm:hidden">rows</span>
            </p>
            {totalEntries && (
                <div>
                    <span className="text-muted-foreground text-xs">({totalEntries} entries)</span>
                </div>
            )}
        </div>
    );

    const renderPageNavigation = () => (
        <div className="flex items-center gap-2">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {currentPage} of {totalPages}
            </div>

            {/* First page button */}
            <Button
                aria-label="Go to first page"
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
            >
                <Icon name="ChevronsLeft" className="size-4 shrink-0" aria-hidden="true" />
            </Button>

            {/* Previous page button */}
            <Button
                aria-label="Go to previous page"
                variant="outline"
                className="size-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                <Icon name="ChevronLeft" className="size-4 shrink-0" aria-hidden="true" />
            </Button>

            {/* Next page button */}
            <Button
                aria-label="Go to next page"
                variant="outline"
                className="size-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                <Icon name="ChevronRight" className="size-4 shrink-0" aria-hidden="true" />
            </Button>

            {/* Last page button */}
            <Button
                aria-label="Go to last page"
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(totalPages - 1)}
                disabled={!table.getCanNextPage()}
            >
                <Icon name="ChevronsRight" className="size-4 shrink-0" aria-hidden="true" />
            </Button>
        </div>
    );

    return (
        <div className={cn('bg-background sticky inset-x-0 bottom-0 z-20 border-t', className)}>
            <div className="flex flex-row items-center justify-between gap-2 space-x-2 px-6 py-3">
                <div className="flex flex-row items-center gap-4 sm:gap-6 lg:gap-8">{renderPageSizeSelector()}</div>
                {renderPageNavigation()}
            </div>
        </div>
    );
}

EnhancedDataTablePagination.displayName = 'EnhancedDataTablePagination';

type EnhancedDataTableBulkActionsProps<TData> = React.PropsWithChildren<{
    table: ReactTable<TData>;
}>;

function EnhancedDataTableBulkActions<TData>({
    table,
    children,
}: EnhancedDataTableBulkActionsProps<TData>): React.JSX.Element {
    const selectedCount = table.getSelectedRowModel().rows.length;

    return (
        <div className="sticky inset-x-0 bottom-12 z-40 h-0 max-w-screen">
            <div className="animate-fadeIn bg-background mx-auto flex h-[60px] max-w-xl -translate-y-full items-center justify-between rounded-md border px-6 py-3 shadow">
                <p className="text-sm font-semibold">{selectedCount} selected</p>
                {children}
            </div>
        </div>
    );
}

EnhancedDataTableBulkActions.displayName = 'EnhancedDataTableBulkActions';

type EnhancedDataTableFilterProps = {
    title?: string;
    options: {
        label: string;
        value: string;
        icon?: React.ComponentType<{ className?: string }>;
    }[];
    selected: string[];
    onChange: (values: string[]) => void;
};

function EnhancedDataTableFilter({ title, options, selected, onChange }: EnhancedDataTableFilterProps) {
    const selectedValues = new Set(selected);
    const hasSelectedValues = selectedValues.size > 0;

    const handleOptionToggle = (value: string) => {
        if (selectedValues.has(value)) {
            selectedValues.delete(value);
        } else {
            selectedValues.add(value);
        }
        const filterValues = Array.from(selectedValues);
        onChange(filterValues.length ? filterValues : []);
    };

    const renderSelectedBadges = () => {
        if (!hasSelectedValues) return null;

        return (
            <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge variant="secondary" className="rounded-xs px-1 font-normal lg:hidden">
                    {selectedValues.size}
                </Badge>
                <div className="hidden space-x-1 lg:flex">
                    {selectedValues.size > 2 ? (
                        <Badge variant="secondary" className="rounded-xs px-1 font-normal">
                            {selectedValues.size} selected
                        </Badge>
                    ) : (
                        options
                            .filter((option) => selectedValues.has(option.value))
                            .map((option) => (
                                <Badge variant="secondary" key={option.value} className="rounded-xs px-1 font-normal">
                                    {option.label}
                                </Badge>
                            ))
                    )}
                </div>
            </>
        );
    };

    const renderFilterOptions = () => (
        <CommandGroup>
            {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                    <CommandItem key={option.value} onSelect={() => handleOptionToggle(option.value)}>
                        <div
                            className={cn(
                                'border-primary mr-2 flex size-4 items-center justify-center rounded-xs border',
                                isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible',
                            )}
                        >
                            <Icon name="Check" className="size-4 shrink-0" />
                        </div>
                        {option.icon && <option.icon className="text-muted-foreground mr-2 size-4" />}
                        <span>{option.label}</span>
                    </CommandItem>
                );
            })}
        </CommandGroup>
    );

    const renderClearFilters = () => {
        if (!hasSelectedValues) return null;

        return (
            <>
                <CommandSeparator />
                <CommandGroup>
                    <CommandItem onSelect={() => onChange([])} className="justify-center text-center">
                        Clear filters
                    </CommandItem>
                </CommandGroup>
            </>
        );
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button aria-label="Sort" variant="outline" size="sm" className="h-9 border-dashed text-sm">
                    <Icon name="PlusCircle" className="mr-2 size-4 shrink-0" />
                    {title}
                    {renderSelectedBadges()}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] overflow-hidden p-0" align="start">
                <Command>
                    <CommandInput placeholder={title} />
                    <CommandList className="h-auto max-h-max overflow-hidden">
                        <ScrollArea className="h-56">
                            <CommandEmpty>No results found.</CommandEmpty>
                            {renderFilterOptions()}
                            {renderClearFilters()}
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

EnhancedDataTableFilter.displayName = 'EnhancedDataTableFilter';

export {
    EnhancedDataTable,
    EnhancedDataTableBulkActions,
    EnhancedDataTableColumnHeader,
    EnhancedDataTableColumnOptionsHeader,
    EnhancedDataTableFilter,
    EnhancedDataTablePagination,
};
