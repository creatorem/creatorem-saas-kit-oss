import { ConsoleMonitoringProvider } from './provider/console/provider';
import { SentryMonitoringProvider } from './provider/sentry/provider';
import { AbstractMonitoringProvider, SupportedProviders } from './types';

export const getProvider = (provider: SupportedProviders = 'sentry'): AbstractMonitoringProvider => {
    switch (provider) {
        case 'console':
            return new ConsoleMonitoringProvider();
        case 'sentry':
            return new SentryMonitoringProvider();
    }

    throw new Error(`Unsupported provider: ${provider}`);
};
