'use client';

import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import type { SQL } from '@kit/drizzle';
import { tableSchemaMap } from '@kit/drizzle';
import type { IconName as NativeIconName } from '@kit/native-ui/icon';
import type { IconName as WebIconName } from '@kit/ui/icon';
import { useApplyFilter } from '@kit/utils/filters';
import { useQuery } from '@tanstack/react-query';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { contentTypeRouter } from '../../../router/router';

type DateRange = {
    from: Date | undefined;
    to?: Date | undefined;
};

export type PeriodOption = {
    label: string;
    value: string;
    icon: NativeIconName & WebIconName;
    /**
     * Use undefined for current date
     * @returns
     */
    getDateRange: () => { startDate: Date; endDate?: Date };
    isCustom?: boolean;
};

export const periodOptions: PeriodOption[] = [
    {
        label: 'Week',
        value: '7d',
        icon: 'Sunrise',
        getDateRange: () => {
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            return { startDate, endDate: undefined };
        },
    },
    {
        label: 'Month',
        value: 'month',
        icon: 'Calendar1',
        getDateRange: () => {
            const endDate = new Date();
            const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
            return { startDate, endDate: undefined };
        },
    },
    {
        label: 'Year',
        value: 'year',
        icon: 'CalendarDays',
        getDateRange: () => {
            const endDate = new Date();
            const startDate = new Date(endDate.getFullYear(), 0, 1);
            return { startDate, endDate: undefined };
        },
    },
    {
        label: 'Custom',
        value: 'custom',
        icon: 'Settings2',
        getDateRange: () => {
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            return { startDate, endDate: undefined };
        },
        isCustom: true,
    },
];

interface AnalyticsFetcherContextType<Keys extends (keyof typeof tableSchemaMap)[]> {
    contentTypes: Keys;
    selectedPeriod: string;
    setSelectedPeriod: (period: string) => void;
    customDateRange: DateRange | undefined;
    setCustomDateRange: (dateRange: DateRange | undefined) => void;
    // data: AnalyticsFetcherData<Keys> | undefined;
    data: NoInfer<AnalyticsFetcherData<Keys>> | undefined;
    isLoading: boolean;
}

export type AnalyticsFetcherData<Keys extends (keyof typeof tableSchemaMap)[]> = {
    [Key in Keys[number]]: (typeof tableSchemaMap)[Key]['_']['inferSelect'][];
};

const AnalyticsFetcherContext = createContext<AnalyticsFetcherContextType<(keyof typeof tableSchemaMap)[]>>({
    contentTypes: [],
    selectedPeriod: 'month',
    setSelectedPeriod: () => {},
    customDateRange: undefined,
    setCustomDateRange: () => {},
    data: {} as AnalyticsFetcherData<(keyof typeof tableSchemaMap)[]>,
    isLoading: false,
});

export const useAnalyticsFetcher = <Keys extends (keyof typeof tableSchemaMap)[]>() => {
    const ctx = useContext(AnalyticsFetcherContext) as unknown as AnalyticsFetcherContextType<Keys>;
    if (!ctx) {
        throw new Error('useAnalyticsFetcher must be used within a AnalyticsFetcherProvider');
    }
    return ctx;
};

export interface AnalyticsFetcherProps<Keys extends (keyof typeof tableSchemaMap)[]> {
    clientTrpc: TrpcClientWithQuery<typeof contentTypeRouter>;
    contentTypes: Keys;
    where?: {
        [Key in Keys[number]]?:
            | ((aliases: (typeof tableSchemaMap)[Key]['_']['inferSelect']) => SQL | undefined)
            | SQL
            | undefined;
    };
    children: React.ReactNode;
}

export const AnalyticsFetcher = <Keys extends (keyof typeof tableSchemaMap)[]>({
    clientTrpc,
    contentTypes,
    children,
    where,
}: AnalyticsFetcherProps<Keys>) => {
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);

    const fetchOrders = useCallback(
        async (startDate: Date, endDate?: Date) =>
            await clientTrpc.analyticsFetcher.fetch({
                contentTypes,
                startDate: startDate.toISOString().split('T')[0] ?? '',
                endDate: endDate ? (endDate.toISOString().split('T')[0] ?? '') : undefined,
                where: where as Record<string, any>,
            }),
        [where, contentTypes, clientTrpc],
    );

    const fetchAnalyticsQueryKey = useApplyFilter('content_type_get_analytics_fetcher_query_key', [
        'fetch-analytics',
        contentTypes,
        selectedPeriod,
        customDateRange,
    ]);

    const { data, isLoading, isFetching } = useQuery<AnalyticsFetcherData<Keys>>({
        queryKey: [...fetchAnalyticsQueryKey],
        queryFn: async () => {
            if (selectedPeriod === 'custom' && customDateRange?.from && customDateRange?.to) {
                return await fetchOrders(customDateRange.from, customDateRange.to);
            } else {
                const selectedOption = periodOptions.find((option: any) => option.value === selectedPeriod);
                if (selectedOption) {
                    const { startDate, endDate } = selectedOption.getDateRange();
                    return await fetchOrders(startDate, endDate);
                } else {
                    throw new Error('no selected option');
                }
            }
        },
    });

    return (
        <AnalyticsFetcherContext.Provider
            value={{
                contentTypes,
                selectedPeriod,
                setSelectedPeriod,
                customDateRange,
                setCustomDateRange,
                // @ts-expect-error
                data,
                isLoading: isLoading || isFetching,
            }}
        >
            {children}
        </AnalyticsFetcherContext.Provider>
    );
};

export interface PeriodSelectorProps {
    selectedPeriod: string;
    onPeriodChange: (period: string) => void;
    onDateRangeChange?: (startDate: Date, endDate: Date | undefined) => void;
    customDateRange?: DateRange;
    className?: string;
    selectorClassName?: string;
    buttonClassName?: string;
    datePickerClassName?: string;
}

export const useAnalyticsFetcherData = <Keys extends keyof typeof tableSchemaMap>() => {
    const ctx = useAnalyticsFetcher<Keys[]>();
    if (!ctx.data) {
        throw new Error(
            'The data object must be defined, make sure to call this hook inside the AnalyticsFetcherOnceDataFetched component.',
        );
    }
    return ctx.data;
};

interface AnalyticsFetcherOnceDataFetchedProps {
    children: React.ReactNode;
}

export const AnalyticsFetcherOnceDataFetched = ({ children }: AnalyticsFetcherOnceDataFetchedProps) => {
    const { data, isLoading } = useAnalyticsFetcher();

    const loaderChildren = useMemo(() => {
        const allChildren = React.Children.toArray(children);
        return allChildren.find((child) => React.isValidElement(child) && child.type === AnalyticsFetcherLoader);
    }, [children]);

    return isLoading || !data ? (loaderChildren ?? null) : children;
};

interface AnalyticsFetcherLoaderProps {
    children: React.ReactNode;
}

export const AnalyticsFetcherLoader = ({ children }: AnalyticsFetcherLoaderProps) => {
    const { data, isLoading } = useAnalyticsFetcher();
    if (!isLoading && data) return null;
    return children;
};

AnalyticsFetcherLoader.displayName = 'AnalyticsFetcherLoader';
