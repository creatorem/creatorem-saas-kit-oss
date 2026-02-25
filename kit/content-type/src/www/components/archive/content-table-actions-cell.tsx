'use client';

import { type TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Button } from '@kit/ui/button';
import { ConfirmButton } from '@kit/ui/confirm-button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Icon } from '@kit/ui/icon';
import { type Row } from '@tanstack/react-table';
import { FileJsonIcon, TableIcon } from 'lucide-react';
import React, { useCallback } from 'react';
import { contentTypeRouter } from '../../../router/router';
import type { BaseEntity, ContentType } from '../../../shared/types';
import { createDeleteHandler, createExportHandler } from '../../utils';

interface ActionsCellProps<T extends BaseEntity> {
    row: Row<T>;
    contentType: ContentType;
    clientTrpc: TrpcClientWithQuery<typeof contentTypeRouter>;
}

export function ContentTableActionsCell<T extends BaseEntity>({ row, contentType, clientTrpc }: ActionsCellProps<T>) {
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleDelete(row.original);
    };

    const handleDelete = useCallback(
        async (item: T) => {
            await createDeleteHandler(clientTrpc, contentType, [item.id]);
        },
        [clientTrpc, contentType],
    );

    const handleExport = useCallback(
        async (item: T, format: 'csv' | 'excel' | 'json') => {
            await createExportHandler(clientTrpc, contentType, format, [item.id]);
        },
        [clientTrpc, contentType],
    );

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    className="data-[state=open]:bg-muted mr-4 ml-auto flex size-8"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Open menu"
                >
                    <Icon name="MoreHorizontal" className="size-4 shrink-0" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export</DropdownMenuLabel>
                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleExport(row.original, 'csv');
                    }}
                >
                    <Icon name="FileBarChart" className="mr-2 h-4 w-4" />
                    Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleExport(row.original, 'excel');
                    }}
                >
                    <TableIcon className="mr-2 h-4 w-4" />
                    Export to Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleExport(row.original, 'json');
                    }}
                >
                    <FileJsonIcon className="mr-2 h-4 w-4" />
                    Export to JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <ConfirmButton
                    asChild
                    variant="ghost"
                    size="sm"
                    aria-label="Delete item"
                    className="!text-destructive hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground relative flex w-full cursor-pointer justify-start rounded-xs px-2 py-1.5 text-sm outline-hidden transition-colors"
                    onConfirmation={handleDeleteClick}
                    template="delete"
                >
                    <DropdownMenuItem className="!text-destructive cursor-pointer">
                        <Icon name="Trash" className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </ConfirmButton>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
