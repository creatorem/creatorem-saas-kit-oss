'use client';

import React, { createContext, useContext } from 'react';
import {
    AnalyticsFetcher,
    AnalyticsFetcherProps,
    useAnalyticsFetcherData,
} from '../../../shared/components/analytics/analytics-fetcher';
import type { ContentType } from '../../../shared/types';
import {
    Analytics,
    AnalyticsAggregateValue,
    AnalyticsAggregateValueProps,
    AnalyticsChart,
    AnalyticsChartProps,
    AnalyticsVariation,
    AnalyticsVariationProps,
} from './analytics';

// Context for SmallAnalytics
interface SmallAnalyticsContextValue {
    contentType: ContentType;
    data: Array<Record<string, any>>;
}

const SmallAnalyticsContext = createContext<SmallAnalyticsContextValue | null>(null);

const useSmallAnalyticsContext = () => {
    const context = useContext(SmallAnalyticsContext);
    if (!context) {
        throw new Error('You are calling useSmallAnalyticsContext outside of the SmallAnalytics component');
    }
    return context;
};

// Root component with AnalyticsFetcher integration
export interface SmallAnalyticsProps extends Pick<AnalyticsFetcherProps<any>, 'clientTrpc'> {
    contentType: ContentType;
    children: React.ReactNode;
}

export function SmallAnalytics({ contentType, children, clientTrpc }: SmallAnalyticsProps) {
    return (
        <AnalyticsFetcher contentTypes={[contentType]} clientTrpc={clientTrpc}>
            <SmallAnalyticsContent contentType={contentType}>{children}</SmallAnalyticsContent>
        </AnalyticsFetcher>
    );
}

// Internal component that uses the fetched data
interface SmallAnalyticsContentProps {
    contentType: ContentType;
    children: React.ReactNode;
}

function SmallAnalyticsContent({ contentType, children }: SmallAnalyticsContentProps) {
    const fetchedData = useAnalyticsFetcherData<typeof contentType>();
    const data = fetchedData[contentType] || [];

    const value: SmallAnalyticsContextValue = {
        contentType,
        data,
    };

    return (
        <Analytics analytics={data as any}>
            <SmallAnalyticsContext.Provider value={value}>{children}</SmallAnalyticsContext.Provider>
        </Analytics>
    );
}

// SmallAnalyticsAggregateValue - extends AnalyticsAggregateValue
export interface SmallAnalyticsAggregateValueProps extends AnalyticsAggregateValueProps {}

export function SmallAnalyticsAggregateValue({ ...props }: SmallAnalyticsAggregateValueProps) {
    return <AnalyticsAggregateValue {...props} />;
}

// SmallAnalyticsVariation - extends AnalyticsVariation
export interface SmallAnalyticsVariationProps extends AnalyticsVariationProps {
    /**
     * The data configuration for variation calculation
     * - { key: string } - Calculate variation based on a specific data key
     * - { method: 'count' } - Calculate variation based on count of items per day using createdAt
     */
    data: AnalyticsVariationProps['data'];
}

export function SmallAnalyticsVariation({ ...props }: SmallAnalyticsVariationProps) {
    return <AnalyticsVariation {...props} />;
}

// SmallAnalyticsChart - extends AnalyticsChart
export interface SmallAnalyticsChartProps extends AnalyticsChartProps {}

export function SmallAnalyticsChart({ ...props }: SmallAnalyticsChartProps) {
    return <AnalyticsChart {...props} />;
}
