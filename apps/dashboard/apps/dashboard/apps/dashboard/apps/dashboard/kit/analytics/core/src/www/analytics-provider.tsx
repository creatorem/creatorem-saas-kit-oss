'use client';

import { isBrowser } from '@kit/utils';
import {
    ClientFilterSlug,
    enqueueFilter,
    Filter,
    FilterCallback,
    removeFilter,
    SyncFilterSlug,
} from '@kit/utils/filters';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { AnalyticsManager } from '../types';

type AnalyticsMapping = {
    [K in ClientFilterSlug & SyncFilterSlug]?: {
        name: string;
        callback: FilterCallback<K>;
    };
};

/**
 * Hook to subscribe to app events and map them to analytics filters
 * @param mapping
 */
function useAnalyticsMapping(mapping: AnalyticsMapping) {
    useEffect(() => {
        const subscriptions = Object.entries(mapping).map(([eventType, handler]) => {
            enqueueFilter(
                eventType as ClientFilterSlug & SyncFilterSlug,
                {
                    name: handler.name,
                    fn: handler.callback,
                } as Filter<ClientFilterSlug & SyncFilterSlug>,
            );
            return () => removeFilter(eventType as ClientFilterSlug, handler.name);
        });
        return () => {
            subscriptions.forEach((unsubscribe) => unsubscribe());
        };
    }, [mapping]);
}

/**
 * Define a mapping of app events to analytics filters
 * Add new mappings here to track new events in the analytics service from app events
 */
const getAnalyticsMapping = (analytics: AnalyticsManager): AnalyticsMapping => ({
    user_signed_in: {
        name: 'userSignIn',
        callback: (_, { userId, traits }) => {
            if (userId) {
                analytics.identify(userId, traits);
            }
            return _;
        },
    },
    user_signed_up: {
        name: 'userSignedUp',
        callback: (_, { method }) => {
            analytics.trackEvent('user_signed_up', { method });
            return _;
        },
    },
    checkout_started: {
        name: 'checkoutStarted',
        callback: (_, { priceId, productId }) => {
            analytics.trackEvent('checkout_started', { priceId, productId });
            return _;
        },
    },
    user_updated: {
        name: 'userUpdated',
        callback: (_) => {
            analytics.trackEvent('user_updated');
            return _;
        },
    },
});

// We use another component because react hooks do not must be rendered conditionally
function AnalyticsProviderBrowser(props: React.PropsWithChildren & { analytics: AnalyticsManager }) {
    // Subscribe to app events and map them to analytics filters
    useAnalyticsMapping(getAnalyticsMapping(props.analytics));

    // Report page views to the analytics service
    useReportPageView((url) => props.analytics.trackPageView(url));

    // Render children
    return props.children;
}

/**
 * Provider for the analytics service
 */
export function AnalyticsProvider(props: React.PropsWithChildren & { analytics: AnalyticsManager }) {
    if (!isBrowser()) {
        return props.children;
    }

    return <AnalyticsProviderBrowser analytics={props.analytics}>{props.children}</AnalyticsProviderBrowser>;
}

/**
 * Hook to report page views to the analytics service
 * @param reportAnalyticsFn
 */
function useReportPageView(reportAnalyticsFn: (url: string) => unknown) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const url = [pathname, searchParams.toString()].filter(Boolean).join('?');

        reportAnalyticsFn(url);
    }, [pathname, reportAnalyticsFn, searchParams]);
}
