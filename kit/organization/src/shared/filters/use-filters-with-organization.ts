'use client';

import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { useCallback } from 'react';
import { useOrganization } from '../../shared';

/**
 * Enqueue all app events that need useOrganization to work.
 */
export const useSharedFiltersWithOrganization = () => {
    const { organization } = useOrganization();

    const ADD_ORGANIZATION_HEADERS_TO_TRPC_REQUEST = 'addOrganizationHeadersToTrpcRequest';
    const addOrganizationHeadersToTrpcRequest: FilterCallback<'get_trpc_headers'> = useCallback(
        (headers) => {
            return {
                ...headers,
                'x-organization-slug': organization.slug,
            };
        },
        [organization],
    );
    useEnqueueFilter('get_trpc_headers', {
        name: ADD_ORGANIZATION_HEADERS_TO_TRPC_REQUEST,
        fn: addOrganizationHeadersToTrpcRequest,
    });

    /* notification package */
    const ADD_ORG_ID_TO_GET_NOTIF_QUERY_KEY = 'addOrgIdToGetNotifQueryKey';
    const addOrgIdToGetNotifQueryKey: FilterCallback<'notification_get_notification_query_key'> = useCallback(
        (qKeys) => [...qKeys, organization.id],
        [organization],
    );
    useEnqueueFilter('notification_get_notification_query_key', {
        name: ADD_ORG_ID_TO_GET_NOTIF_QUERY_KEY,
        fn: addOrgIdToGetNotifQueryKey,
    });

    /* notification package */
    const ADD_ORG_ID_TO_ANALYTICS_FETCHER_QUERY_KEY = 'addOrgIdToAnalyticsFetcherQueryKey';
    const addOrgIdToAnalyticsFetcherQueryKey: FilterCallback<'content_type_get_analytics_fetcher_query_key'> =
        useCallback((qKeys) => [...qKeys, organization.id], [organization]);
    useEnqueueFilter('content_type_get_analytics_fetcher_query_key', {
        name: ADD_ORG_ID_TO_ANALYTICS_FETCHER_QUERY_KEY,
        fn: addOrgIdToAnalyticsFetcherQueryKey,
    });
};
