'use client';

import * as React from 'react';

import { MonitoringProvider as MonitoringProviderImpl } from '../../provider';
import type { AbstractMonitoringProvider } from '../../types';
import { useMonitoringFiltersWithContext } from '../filters/use-filters-with-ctx';

const MonitoringContext = React.createContext<AbstractMonitoringProvider>(MonitoringProviderImpl);

const MonitoringProviderChild: React.FC = () => {
    useMonitoringFiltersWithContext();
    return null;
};
export function MonitoringProvider(props: React.PropsWithChildren): React.JSX.Element {
    return (
        <MonitoringContext.Provider value={MonitoringProviderImpl}>
            <MonitoringProviderChild />
            {props.children}
        </MonitoringContext.Provider>
    );
}

export function useMonitoring(): AbstractMonitoringProvider {
    return React.useContext(MonitoringContext);
}
