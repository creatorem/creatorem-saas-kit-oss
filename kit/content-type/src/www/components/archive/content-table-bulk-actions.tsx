'use client';

/**
 * This component provides configurable bulk actions for selected table rows,
 * including export functionality and custom action handlers.
 */

import { type TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Button } from '@kit/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@kit/ui/dropdown-menu';
import { EnhancedDataTableBulkActions } from '@kit/ui/enhanced-data-table';
import { Icon } from '@kit/ui/icon';
import { toast } from '@kit/ui/sonner';
import { cn } from '@kit/utils';
import { type Table } from '@tanstack/react-table';
import React, { useCallback } from 'react';
import { contentTypeRouter } from '../../../router/router';
import type { BaseEntity, BulkAction, ContentType } from '../../../shared/types';
import { createDeleteHandler, createExportHandler } from '../../utils';

interface ContentTableBulkActionsProps<T extends BaseEntity> {
    table: Table<T>;
    actions: BulkAction<T>[];
    contentType?: string; // Add contentType prop for entity identification
}

export function ContentTableBulkActions<T extends BaseEntity>({
    table,
    actions,
    contentType = 'item',
}: ContentTableBulkActionsProps<T>) {
    const [isLoading, setIsLoading] = React.useState(false);
    const selectedRows = table.getSelectedRowModel().rows;

    return (
        <EnhancedDataTableBulkActions table={table}>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="default"
                        className="text-sm"
                        aria-label="Bulk actions"
                        disabled={isLoading}
                    >
                        Bulk actions
                        <Icon name="ChevronsUpDown" className="ml-1 size-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {actions.map((action) => (
                        <DropdownMenuItem
                            key={action.id}
                            className={cn(
                                'flex cursor-pointer items-center gap-2',
                                action.variant === 'destructive' ? '!text-destructive' : '',
                            )}
                            onClick={async () => {
                                try {
                                    setIsLoading(true);
                                    await action.action(selectedRows.map((row) => row.original));
                                } catch (error) {
                                    console.error('Action error:', error);
                                    if (!action.suppressErrorToast) {
                                        toast.error('Action failed');
                                    }
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                            disabled={isLoading}
                        >
                            {action.icon}
                            {action.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </EnhancedDataTableBulkActions>
    );
}

interface ContentTableBulkActionsWithPremadeHandlersProps<T extends BaseEntity> {
    table: Table<T>;
    actions: BulkAction<T>[];
    contentType: ContentType;
    clientTrpc: TrpcClientWithQuery<typeof contentTypeRouter>;
}

export const ContentTableBulkActionsWithPremadeHandlers = <T extends BaseEntity>({
    table,
    actions: bulkActions,
    contentType,
    clientTrpc,
}: ContentTableBulkActionsWithPremadeHandlersProps<T>) => {
    const createBulkExportHandler = useCallback(
        (format: 'csv' | 'excel' | 'json') => async (selectedItems: T[]) => {
            await createExportHandler(
                clientTrpc,
                contentType,
                format,
                selectedItems.map((item) => item.id),
            );
        },
        [clientTrpc, contentType],
    );

    const handleBulkDelete = useCallback(
        async (selectedItems: T[]) => {
            await createDeleteHandler(
                clientTrpc,
                contentType,
                selectedItems.map((item) => item.id),
            );
            table.resetRowSelection();
        },
        [clientTrpc, contentType, table],
    );

    return (
        <ContentTableBulkActions
            table={table}
            actions={
                bulkActions.length > 0
                    ? bulkActions
                    : [
                          {
                              id: 'export-csv',
                              label: 'Export to CSV',
                              icon: <Icon name="FileBarChart" className="h-4 w-4" />,
                              action: createBulkExportHandler('csv'),
                              suppressSuccessToast: true,
                              suppressErrorToast: true,
                          },
                          {
                              id: 'export-excel',
                              label: 'Export to Excel',
                              icon: <Icon name="Table" className="h-4 w-4" />,
                              action: createBulkExportHandler('excel'),
                              suppressSuccessToast: true,
                              suppressErrorToast: true,
                          },
                          {
                              id: 'export-json',
                              label: 'Export to JSON',
                              icon: <Icon name="FileJson" className="h-4 w-4" />,
                              action: createBulkExportHandler('json'),
                              suppressSuccessToast: true,
                              suppressErrorToast: true,
                          },
                          {
                              id: 'delete',
                              label: `Delete ${contentType}s`,
                              icon: <Icon name="Trash" className="text-destructive h-4 w-4" />,
                              action: handleBulkDelete,
                              variant: 'destructive' as const,
                              requireConfirmation: true,
                              suppressSuccessToast: true,
                              suppressErrorToast: true,
                          },
                      ]
            }
            contentType={contentType}
        />
    );
};
