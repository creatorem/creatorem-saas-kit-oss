'use client';

import React, { createContext, useContext } from 'react';
import { Analytics } from '../../../shared/components/analytics/analytics';
import {
    AnalyticsFetcher,
    AnalyticsFetcherProps,
    useAnalyticsFetcherData,
} from '../../../shared/components/analytics/analytics-fetcher';
import type { ContentType } from '../../../shared/types';

// Context for CTAnalytics
interface CTAnalyticsContextValue {
    contentType: ContentType;
}

const CTAnalyticsContext = createContext<CTAnalyticsContextValue>({
    contentType: 'order',
});

const useCTAnalyticsContext = () => {
    const context = useContext(CTAnalyticsContext);
    if (!context) {
        throw new Error('useCTAnalyticsContext must be used within a CTAnalyticsProvider');
    }
    return context;
};

export interface CTAnalyticsProps extends Pick<AnalyticsFetcherProps<any>, 'clientTrpc'> {
    contentType: ContentType;
    children: React.ReactNode;
}

export function CTAnalyticsFetcher({ contentType, children, clientTrpc }: CTAnalyticsProps) {
    return (
        <CTAnalyticsContext.Provider value={{ contentType }}>
            <AnalyticsFetcher contentTypes={[contentType]} clientTrpc={clientTrpc}>
                {children}
            </AnalyticsFetcher>
        </CTAnalyticsContext.Provider>
    );
}

interface CTAnalyticsContentProps {
    children: React.ReactNode;
}

export function CTAnalyticsFetcherOnceDataFetched({ children }: CTAnalyticsContentProps) {
    const { contentType } = useCTAnalyticsContext();
    const fetchedData = useAnalyticsFetcherData<typeof contentType>();
    const data = fetchedData[contentType] || [];

    return <Analytics analytics={data as Record<string, unknown>[]}>{children}</Analytics>;
}
