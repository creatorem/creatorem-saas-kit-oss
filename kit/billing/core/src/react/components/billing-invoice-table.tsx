'use client';

import { BillingInvoice, BillingList } from '@kit/billing-types';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@kit/ui/dropdown-menu';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/ui/empty';
import { Icon } from '@kit/ui/icon';
import { Skeleton } from '@kit/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kit/ui/table';
import { cn, formatCurrency } from '@kit/utils';
import { capitalize } from 'lodash';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { formatDate } from '../utils/format';

function mapInvoiceStatusToBadgeVariant(
    status: BillingInvoice['status'],
): React.ComponentProps<typeof Badge>['variant'] {
    switch (status) {
        case 'draft':
        case 'open': {
            return 'outline';
        }

        case 'paid':
        case 'void': {
            return 'secondary';
        }

        case 'uncollectible': {
            return 'destructive';
        }

        default: {
            return 'default';
        }
    }
}

export type BillingInvoiceTableProps = {
    invoices: BillingList<BillingInvoice>;
    className?: string;
    numberAfterComma: number;
};

/* 
id: string;
amount: number;
currency: string;
label: string;
status: "paid" | "open" | "draft" | "void" | "uncollectible";
downloadUrl?: string;
date: number;
lines: {
    id: string;
    amount: number;
    label:string;
    currency: string;
    quantity: number;
}[];
*/

export function BillingInvoiceTable({
    invoices,
    numberAfterComma,
    className,
    ...other
}: BillingInvoiceTableProps): React.JSX.Element {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRowExpansion = useCallback(
        (invoiceId: string) => {
            const newExpandedRows = new Set(expandedRows);
            if (newExpandedRows.has(invoiceId)) {
                newExpandedRows.delete(invoiceId);
            } else {
                newExpandedRows.add(invoiceId);
            }
            setExpandedRows(newExpandedRows);
        },
        [expandedRows],
    );

    const isRowExpanded = (invoiceId: string) => expandedRows.has(invoiceId);

    return invoices.data.length > 0 ? (
        <Table className={cn('w-full', className)} {...other}>
            <TableHeader>
                <TableRow className="border-b hover:bg-inherit">
                    <TableHead className="truncate text-left font-medium text-inherit">Invoice</TableHead>
                    <TableHead className="text-right font-medium text-inherit">Amount</TableHead>
                    <TableHead className="pr-4 text-right font-medium text-inherit">Date</TableHead>
                    <TableHead className="pr-4 text-right font-medium text-inherit"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.data.map((invoice) => (
                    <React.Fragment key={invoice.id}>
                        <TableRow
                            className="cursor-pointer border-b hover:bg-inherit"
                            onClick={() => toggleRowExpansion(invoice.id)}
                        >
                            <TableCell className="truncate">
                                <div className="flex items-center gap-2">
                                    {invoice.lines.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 hover:bg-transparent"
                                            aria-label={
                                                isRowExpanded(invoice.id)
                                                    ? 'Collapse invoice details'
                                                    : 'Expand invoice details'
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleRowExpansion(invoice.id);
                                            }}
                                        >
                                            {isRowExpanded(invoice.id) ? (
                                                <Icon name="ChevronDown" className="h-4 w-4" />
                                            ) : (
                                                <Icon name="ChevronRight" className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                    {invoice.label}
                                    {!!invoice.status && (
                                        <Badge
                                            variant={mapInvoiceStatusToBadgeVariant(invoice.status)}
                                            className="my-auto ml-2"
                                        >
                                            {capitalize(invoice.status)}
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                {formatCurrency({
                                    value: invoice.amount / 100,
                                    currencyCode: invoice.currency,
                                    locale: 'fr-FR',
                                    numberAfterComma,
                                })}
                            </TableCell>
                            <TableCell className="pr-4 text-right">{formatDate(invoice.date)}</TableCell>
                            <TableCell className="truncate">
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="size-8 p-0"
                                            aria-label="Open menu"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Icon name="MoreHorizontal" className="size-4 shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            asChild
                                            className="cursor-pointer"
                                            disabled={!invoice.downloadUrl}
                                        >
                                            <Link href={invoice.downloadUrl ?? '~/'}>Download Invoice</Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>

                        {/* Expanded row with line details */}
                        {isRowExpanded(invoice.id) && invoice.lines && invoice.lines.length > 0 && (
                            <TableRow className="bg-muted/30 border-b">
                                <TableCell colSpan={4} className="p-0">
                                    <div className="p-4">
                                        <div className="mb-3">
                                            <h4 className="mb-2 text-sm font-medium">Invoice Details</h4>
                                            <div className="space-y-2">
                                                {invoice.lines.map((line) => (
                                                    <div
                                                        key={line.id}
                                                        className="flex items-center justify-between text-sm"
                                                    >
                                                        <div className="flex-1">
                                                            <span className="font-medium">{line.label}</span>
                                                            {line.quantity > 1 && (
                                                                <span className="text-muted-foreground ml-2">
                                                                    × {line.quantity}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="font-medium">
                                                            {formatCurrency({
                                                                value: line.amount / 100,
                                                                currencyCode: line.currency,
                                                                locale: 'fr-FR',
                                                                numberAfterComma,
                                                            })}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="border-t pt-3">
                                            <div className="flex items-center justify-between font-medium">
                                                <span>Total</span>
                                                <span>
                                                    {formatCurrency({
                                                        value: invoice.amount / 100,
                                                        currencyCode: invoice.currency,
                                                        locale: 'fr-FR',
                                                        numberAfterComma,
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </React.Fragment>
                ))}
            </TableBody>
        </Table>
    ) : (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Icon name="BookOpen" className="size-6" />
                </EmptyMedia>
                <EmptyTitle>No invoices found</EmptyTitle>
                <EmptyDescription>You will receive an invoice for each subscription you have.</EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}

// skeleton version
export function BillingBreakdownSkeletonTable(): React.JSX.Element {
    return (
        <Table className="w-full">
            <TableHeader>
                <TableRow className="border-b hover:bg-inherit">
                    <TableHead className="max-w-[200px] truncate text-left font-medium text-inherit">
                        <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead className="pr-4 text-right font-medium text-inherit">
                        <Skeleton className="ml-auto h-4 w-16" />
                    </TableHead>
                    <TableHead className="max-w-[200px] truncate text-left font-medium text-inherit">
                        <Skeleton className="h-4 w-24" />
                    </TableHead>
                    <TableHead className="text-right font-medium text-inherit">
                        <Skeleton className="ml-auto h-4 w-16" />
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow className="border-b hover:bg-inherit">
                    <TableCell className="max-w-[200px] truncate">
                        <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                        <Skeleton className="ml-auto h-4 w-8" />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                        <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                        <Skeleton className="ml-auto h-4 w-16" />
                    </TableCell>
                </TableRow>
                <TableRow className="hover:bg-inherit">
                    <TableCell>
                        <div className="flex items-center">
                            <Skeleton className="mr-2 h-4 w-32" />
                            <Icon name="Info" className="text-muted-foreground size-3.5 shrink-0" />
                        </div>
                    </TableCell>
                    <TableCell colSpan={3} className="text-right font-medium">
                        <Skeleton className="ml-auto h-4 w-20" />
                    </TableCell>
                </TableRow>
                <TableRow className="hover:bg-inherit">
                    <TableCell>
                        <div className="flex items-center">
                            <Skeleton className="mr-2 h-4 w-36" />
                            <Icon name="Info" className="text-muted-foreground size-3.5 shrink-0" />
                        </div>
                    </TableCell>
                    <TableCell colSpan={3} className="text-right font-medium">
                        <Skeleton className="ml-auto h-4 w-20" />
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}
