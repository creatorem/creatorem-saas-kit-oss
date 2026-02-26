'use client';

import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { useMonitoring } from '../components/monitoring-provider';

/**
 * Enqueue all app events that need useOrganization to work.
 */
export function useMonitoringFiltersWithContext() {
    const monitoring = useMonitoring();

    const ADD_MONITORING_CAPTURE = 'addMonitoringCapture';
    const addMonitoringCapture: FilterCallback<'capture_global_error'> = (_, { error, digest }) => {
        void monitoring.captureError(error, { digest });
        return _;
    };
    useEnqueueFilter('capture_global_error', {
        name: ADD_MONITORING_CAPTURE,
        fn: addMonitoringCapture,
    });

    /* authentication */
    const SET_MONITORING_USER_ON_SIGN_IN = 'setMonitoringUserOnSignIn';
    const setMonitoringUserOnSignIn: FilterCallback<'user_signed_in'> = (_, { userId, traits }) => {
        monitoring.setUser({ id: userId, ...traits });
        return _;
    };

    useEnqueueFilter('user_signed_in', {
        name: SET_MONITORING_USER_ON_SIGN_IN,
        fn: setMonitoringUserOnSignIn,
    });
}
