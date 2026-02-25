'use client';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { ConfirmButton } from '@kit/ui/confirm-button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@kit/ui/dialog';
import {
    EnhancedDataTable,
    EnhancedDataTableColumnHeader,
    EnhancedDataTableFilter,
    EnhancedDataTablePagination,
} from '@kit/ui/enhanced-data-table';
import { Icon } from '@kit/ui/icon';
import { Input } from '@kit/ui/input';
import { Skeleton } from '@kit/ui/skeleton';
import { VisuallyHidden } from '@kit/ui/visually-hidden';
import { cn } from '@kit/utils';
import { useMutation } from '@tanstack/react-query';
import {
    ColumnDef,
    ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    Row,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { KeyboardEvent, MouseEvent, useCallback, useMemo, useRef, useState } from 'react';
import type { KeybindingContext } from '../types';
import { useKeybindings } from '../ui/context';
import { formatShortcutForDisplay, normalizeShortcut } from '../utils/parse-shortcut';
import { ShortcutDisplay } from './keybinding-display';

export interface KeybindingsTableProps {
    /**
     * Filter the keybindings by context
     */
    filter?: KeybindingContext;
    className?: string;
    /**
     * Optional pre-loaded keybindings data to avoid loading flash
     */
    initialKeybindings?: Record<string, string>;
    /**
     * Whether to show loading skeleton
     * @default false
     */
    isLoading?: boolean;
}

interface KeybindingTableRow {
    id: string;
    name: string;
    description: string;
    shortcut: string | null;
    defaultShortcut: string | undefined;
    context: KeybindingContext;
    when: string;
    isCustomized: boolean;
}

const contextDescriptions: Record<KeybindingContext, string> = {
    global: 'Available everywhere',
    contextual: 'Context-specific pages',
    form: 'When focused on forms',
    item: 'When an item is selected',
    modal: 'In modal dialogs',
    list: 'In list views',
};

// Skeleton component for loading state
function KeybindingsTableSkeleton() {
    return (
        <div className="space-y-4">
            {/* Header skeleton */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-2">
                    <Skeleton className="h-9 w-full max-w-sm" />
                    <Skeleton className="h-9 w-20" />
                </div>
                <Skeleton className="h-9 w-24" />
            </div>

            {/* Table skeleton */}
            <div className="rounded-md border">
                <div className="flex flex-col gap-3 p-4">
                    {/* Table header */}
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                    </div>

                    {/* Table rows */}
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            </div>

            {/* Pagination skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    );
}

export function KeybindingsTable({ filter, className, initialKeybindings, isLoading = false }: KeybindingsTableProps) {
    const { model, getShortcut, setShortcut, resetShortcut, resetAllShortcuts, isInitialized } = useKeybindings();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20,
    });
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [editingRow, setEditingRow] = useState<KeybindingTableRow | null>(null);
    const [editingShortcut, setEditingShortcut] = useState('');
    const [recordingKeys, setRecordingKeys] = useState(false);
    const [conflictMessage, setConflictMessage] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Use initialKeybindings if provided, otherwise fall back to context
    const getEffectiveShortcut = useCallback(
        (actionId: string) => {
            if (initialKeybindings && initialKeybindings[actionId] !== undefined) {
                return initialKeybindings[actionId] || (model[actionId]?.defaultShortcut ?? null);
            }
            return getShortcut(actionId);
        },
        [initialKeybindings, getShortcut, model],
    );

    // Show loading if explicitly loading or if context is not initialized and no initial data
    const shouldShowLoading = isLoading || (!isInitialized && !initialKeybindings);

    // Transform actions into table rows
    const data: KeybindingTableRow[] = useMemo(() => {
        if (shouldShowLoading) return [];

        return Object.entries(model)
            .filter(([_, action]) => !filter || action.context === filter)
            .map(([actionId, action]) => {
                const currentShortcut = getEffectiveShortcut(actionId);
                return {
                    id: actionId,
                    name: action.name,
                    description: action.description,
                    shortcut: currentShortcut,
                    defaultShortcut: action.defaultShortcut,
                    context: action.context as KeybindingContext,
                    when: contextDescriptions[action.context as KeybindingContext],
                    isCustomized: Boolean(
                        currentShortcut &&
                        action.defaultShortcut !== undefined &&
                        currentShortcut !== action.defaultShortcut,
                    ),
                };
            });
    }, [model, filter, getEffectiveShortcut, shouldShowLoading]);

    // Check for keybinding conflicts
    const checkForConflicts = useCallback(
        (shortcut: string, currentActionId: string) => {
            if (!shortcut) {
                setConflictMessage('');
                return;
            }

            const normalizedShortcut = normalizeShortcut(shortcut);

            // Check all actions for conflicts
            for (const [actionId, action] of Object.entries(model)) {
                if (actionId === currentActionId) continue;

                const existingShortcut = getEffectiveShortcut(actionId);
                if (existingShortcut && normalizeShortcut(existingShortcut) === normalizedShortcut) {
                    setConflictMessage(`This keybinding is already used by "${action.name}"`);
                    return;
                }
            }

            setConflictMessage('This keybinding is available');
        },
        [model, getEffectiveShortcut],
    );

    const handleRowClick = (row: Row<KeybindingTableRow>) => {
        const rowData = row.original;
        setEditingRow(rowData);
        setEditingShortcut(String(rowData.shortcut || ''));
        setRecordingKeys(true);
        checkForConflicts(String(rowData.shortcut || ''), rowData.id);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleCancel = () => {
        setEditingRow(null);
        setEditingShortcut('');
        setRecordingKeys(false);
        setConflictMessage('');
    };

    // Mutation for saving keybindings
    const saveKeybindingMutation = useMutation({
        mutationFn: async ({ actionId, shortcut }: { actionId: string; shortcut: string | null }) => {
            if (shortcut) {
                await setShortcut(actionId, normalizeShortcut(shortcut));
            } else {
                await resetShortcut(actionId);
            }
        },
        onSuccess: () => {
            // Close dialog and reset state
            handleCancel();
        },
        onError: (error) => {
            // Show error message
            setConflictMessage('Failed to save keybinding. Please try again.');
            console.error('Failed to save keybinding:', error);
        },
    });

    const handleSave = () => {
        if (!editingRow) return;

        saveKeybindingMutation.mutate({
            actionId: editingRow.id,
            shortcut: editingShortcut || null,
        });
    };

    // Mutation for resetting keybindings
    const resetKeybindingMutation = useMutation({
        mutationFn: async ({ actionId }: { actionId: string }) => {
            await resetShortcut(actionId);
        },
        onSuccess: () => {
            // Close dialog and reset state
            handleCancel();
        },
        onError: (error) => {
            // Show error message
            setConflictMessage('Failed to reset keybinding. Please try again.');
            console.error('Failed to reset keybinding:', error);
        },
    });

    const handleReset = (e: MouseEvent, actionId: string) => {
        e.stopPropagation();

        resetKeybindingMutation.mutate({
            actionId,
        });
    };

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!recordingKeys || !editingRow || saveKeybindingMutation.isPending || resetKeybindingMutation.isPending)
                return;

            e.preventDefault();
            e.stopPropagation();

            // Enter to save
            if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                handleSave();
                return;
            }

            // ESC to cancel
            if (e.key === 'Escape') {
                handleCancel();
                return;
            }

            const keys: string[] = [];
            if (e.metaKey || e.ctrlKey) keys.push('cmd');
            if (e.altKey) keys.push('alt');
            if (e.shiftKey) keys.push('shift');

            const key = e.key.toLowerCase();
            if (!['control', 'meta', 'alt', 'shift'].includes(key)) {
                keys.push(key);
            }

            if (keys.length > 0) {
                const newShortcut = keys.join('+');
                setEditingShortcut(newShortcut);
                checkForConflicts(newShortcut, editingRow.id);
            }
        },
        [
            recordingKeys,
            editingRow,
            handleCancel,
            handleSave,
            checkForConflicts,
            saveKeybindingMutation.isPending,
            resetKeybindingMutation.isPending,
        ],
    );

    const columns = useMemo<ColumnDef<KeybindingTableRow>[]>(
        () => [
            {
                accessorKey: 'name',
                header: ({ column }) => <EnhancedDataTableColumnHeader column={column} title="Command" />,
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium">{row.original.name}</div>
                        {row.original.description && (
                            <div className="text-muted-foreground text-xs">{row.original.description}</div>
                        )}
                    </div>
                ),
                enableSorting: true,
                enableHiding: false,
            },
            {
                accessorKey: 'shortcut',
                header: ({ column }) => <EnhancedDataTableColumnHeader column={column} title="Keybinding" />,
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <ShortcutDisplay shortcut={row.original.shortcut} />
                        {row.original.isCustomized && (
                            <Badge variant="secondary" className="h-4 rounded-lg px-1.5 font-mono text-[10px]">
                                Modified
                            </Badge>
                        )}
                    </div>
                ),
                enableSorting: false,
            },
            {
                accessorKey: 'when',
                header: ({ column }) => <EnhancedDataTableColumnHeader column={column} title="When" />,
                cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.when}</span>,
                enableSorting: true,
                filterFn: (row, id, value) => {
                    return value.includes(row.getValue(id));
                },
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {row.original.isCustomized && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => handleReset(e, row.original.id)}
                                aria-label={`Reset keybinding for ${row.original.name}`}
                            >
                                <Icon name="RotateCcw" className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
                size: 80,
            },
        ],
        [handleReset],
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString',
        state: {
            sorting,
            columnFilters,
            globalFilter,
            pagination,
        },
    });

    const whenOptions = useMemo(() => {
        return Object.entries(contextDescriptions).map(([context, description]) => ({
            label: description,
            value: description,
        }));
    }, []);

    // Show skeleton while loading
    if (shouldShowLoading) {
        return (
            <div className={cn(className)}>
                <KeybindingsTableSkeleton />
            </div>
        );
    }

    return (
        <>
            <div className={cn('space-y-4', className)}>
                {/* Header with search and filters */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-1 items-center gap-2">
                        <div className="relative max-w-sm flex-1">
                            <Icon
                                name="Search"
                                className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                            />
                            <Input
                                placeholder="Search keybindings..."
                                value={globalFilter ?? ''}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="h-9 pr-9 pl-9"
                            />
                            {globalFilter && (
                                <button
                                    onClick={() => setGlobalFilter('')}
                                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                                    aria-label="Clear search"
                                >
                                    <Icon name="X" className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <EnhancedDataTableFilter
                            title="When"
                            options={whenOptions}
                            selected={(table.getColumn('when')?.getFilterValue() as string[]) ?? []}
                            onChange={(values: string[]) =>
                                table.getColumn('when')?.setFilterValue(values.length ? values : undefined)
                            }
                        />
                    </div>

                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        className="h-9"
                        aria-label="Reset all keybindings"
                        header={{
                            title: 'Reset All Keybindings',
                            description:
                                "This will restore all keybindings to their default settings. Any custom shortcuts you've configured will be lost.",
                        }}
                        operation={{
                            type: 'write',
                            value: 'RESET ALL KEYBINDINGS',
                        }}
                        buttonLabels={{
                            cancel: 'Cancel',
                            confirm: 'Reset All',
                        }}
                        onConfirmation={resetAllShortcuts}
                    >
                        <Icon name="RotateCcw" className="mr-1.5 h-3.5 w-3.5" />
                        Reset All
                    </ConfirmButton>
                </div>

                {/* Data table */}
                <div className="rounded-md border">
                    <EnhancedDataTable table={table} onRowClicked={handleRowClick} />
                </div>

                {/* Pagination */}
                <EnhancedDataTablePagination table={table} className="border-none" />
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingRow} onOpenChange={(open) => !open && handleCancel()}>
                <DialogContent showCloseButton={false} onKeyDown={handleKeyDown} className="max-w-md">
                    <VisuallyHidden>
                        <DialogTitle>Edit Keybinding</DialogTitle>
                        <DialogDescription>Edit the keybinding for the selected command.</DialogDescription>
                    </VisuallyHidden>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-muted-foreground text-center text-xs">
                                Press desired key combination and then press{' '}
                            </p>
                            <kbd className="bg-muted/70 text-foreground/80 border-border/50 inline-flex size-5 items-center justify-center rounded-sm border font-mono text-xs shadow-xs">
                                <Icon name="CornerDownLeft" className="size-3" />
                            </kbd>
                        </div>

                        <div className="space-y-2">
                            <div className="text-center">
                                <h3 className="font-medium">{editingRow?.name}</h3>
                                {editingRow?.description && (
                                    <p className="text-muted-foreground text-sm">{editingRow.description}</p>
                                )}
                            </div>

                            {/* Show default shortcut if different from current */}
                            {editingRow?.defaultShortcut && editingRow.defaultShortcut !== editingRow.shortcut && (
                                <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
                                    <span>Default</span>
                                    <ShortcutDisplay
                                        shortcut={editingRow.defaultShortcut}
                                        kbdClassName="h-4 min-w-4 px-1 rounded-sm text-[10px] bg-muted/50"
                                    />
                                </div>
                            )}

                            <div className="relative">
                                <Input
                                    ref={inputRef}
                                    value={editingShortcut ? formatShortcutForDisplay(editingShortcut) : ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setEditingShortcut(value);
                                        checkForConflicts(value, editingRow?.id ?? '');
                                    }}
                                    placeholder="Press keys..."
                                    className="h-12 text-center font-mono text-lg opacity-0"
                                    autoFocus
                                    disabled={saveKeybindingMutation.isPending || resetKeybindingMutation.isPending}
                                />
                                {recordingKeys && editingShortcut && (
                                    <div className="bg-background/90 pointer-events-none absolute inset-0 flex items-center justify-center rounded-sm">
                                        <ShortcutDisplay
                                            shortcut={editingShortcut}
                                            kbdClassName="h-8 min-w-8 px-2 rounded-md text-xl gap-2 bg-background"
                                        />
                                    </div>
                                )}
                            </div>

                            {conflictMessage && (
                                <div
                                    className={cn(
                                        'rounded p-2 text-center text-sm',
                                        conflictMessage.includes('already used')
                                            ? 'text-destructive bg-destructive/10'
                                            : 'bg-green-600/10 text-green-600 dark:text-green-400',
                                    )}
                                >
                                    {conflictMessage}
                                </div>
                            )}

                            <div className="flex justify-center gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancel}
                                    aria-label={`Cancel editing ${editingRow?.name ?? ''} keybinding`}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={
                                        conflictMessage.includes('already used') || resetKeybindingMutation.isPending
                                    }
                                    loading={saveKeybindingMutation.isPending}
                                    aria-label={`Save ${editingRow?.name ?? ''} keybinding`}
                                >
                                    Save
                                </Button>
                                {editingRow?.isCustomized && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => handleReset(e, editingRow.id)}
                                        disabled={saveKeybindingMutation.isPending}
                                        loading={resetKeybindingMutation.isPending}
                                        aria-label={`Reset ${editingRow.name} keybinding`}
                                    >
                                        Reset to default
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
