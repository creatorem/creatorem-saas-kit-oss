'use client';

import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { AnalyticsProvider } from '../analytics-provider';

/**
 * Enqueue all app events that need useOrganization to work.
 */
export default function useAnalyticsFilters() {
    const ADD_ANALYTICS_PROVIDER = 'addAnalyticsProvider';
    const addAnalyticsProvider: FilterCallback<'display_app_provider'> = (children, { analytics }) => {
        if (!analytics) {
            return children;
        }

        return <AnalyticsProvider analytics={analytics}>{children}</AnalyticsProvider>;
    };

    useEnqueueFilter('display_app_provider', {
        name: ADD_ANALYTICS_PROVIDER,
        fn: addAnalyticsProvider,
    });
}
