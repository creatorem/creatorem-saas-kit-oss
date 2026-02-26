'use client';

import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { MonitoringProvider } from '../components/monitoring-provider';

/**
 * Enqueue all app events that need useOrganization to work.
 */
export default function useMonitoringFilters() {
    const ADD_MONITORING_PROVIDER = 'addMonitoringProvider';
    const addMonitoringProvider: FilterCallback<'display_app_provider'> = (children) => {
        return <MonitoringProvider>{children}</MonitoringProvider>;
    };

    useEnqueueFilter('display_app_provider', {
        name: ADD_MONITORING_PROVIDER,
        fn: addMonitoringProvider,
    });
}
