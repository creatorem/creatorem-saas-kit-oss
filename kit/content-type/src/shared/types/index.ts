import { tableSchemaMap } from '@kit/drizzle';
import { IconName } from '@kit/ui/icon';
import type { ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';

// export type ContentType = string;
export type ContentType = keyof typeof tableSchemaMap;

export interface BaseEntity {
    id: string;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface ContentTableColumn<T = any> {
    id?: string;
    header: string | (() => ReactNode);
    accessorKey?: string;
    cell?: (info: { row: { original: T } }) => ReactNode;
    enableSorting?: boolean;
    enableHiding?: boolean;
}

export interface ContentTableProps<T extends BaseEntity> {
    disableScroll?: boolean;
    icon?: IconName;
    newItemLink?: string;
    dataTablePaginationClassName?: string;
    scrollAreaClassName?: string;
    className?: string;
    contentType: ContentType;
    data: T[];
    columns: ColumnDef<T>[];
    searchPlaceholder?: string;
    filters?: ContentFilter[];
    bulkActions?: BulkAction<T>[];
    emptyStateTitle?: string;
    emptyStateDescription?: string;
    onRowClick?: (row: T) => void;
    pageSize?: number;
    // Server-side pagination props
    totalCount?: number;
    currentPage?: number;
    clientTrpc?: any;
}

export interface ContentFilter {
    id: string;
    label: string;
    type: 'search' | 'select' | 'multiselect' | 'tabs';
    options?: FilterOption[];
    placeholder?: string;
}

export interface FilterOption {
    value: string;
    label: string;
    icon?: ReactNode;
}

export interface BulkAction<T> {
    id: string;
    label: string;
    icon?: ReactNode;
    action: (selectedRows: T[]) => void | Promise<void>;
    variant?: 'default' | 'destructive';
    requireConfirmation?: boolean;
    suppressSuccessToast?: boolean;
    suppressErrorToast?: boolean;
}

export interface ChartConfig {
    [key: string]: {
        label: string;
        color?: string;
    };
}

export interface ChartCardProps {
    title: string;
    description?: string;
    data: any[];
    chartType: 'bar' | 'line' | 'area' | 'pie';
    config?: ChartConfig;
    className?: string;
}

export interface AnalyticsCardProps<T extends BaseEntity> {
    title: string;
    items: T[];
    renderItem: (item: T) => ReactNode;
    emptyText?: string;
    className?: string;
}

export interface ContentFormField {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    validation?: any;
}

export interface ContentFormProps<T extends BaseEntity> {
    contentType: ContentType;
    fields: ContentFormField[];
    onSubmit: (data: Partial<T>) => void | Promise<void>;
    defaultValues?: Partial<T>;
    mode?: 'create' | 'edit';
    className?: string;
}

export interface ContentModalProps<T extends BaseEntity> {
    contentType: ContentType;
    mode: 'create' | 'edit' | 'delete';
    data?: T;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<T>) => void | Promise<void>;
    title?: string;
    description?: string;
}
