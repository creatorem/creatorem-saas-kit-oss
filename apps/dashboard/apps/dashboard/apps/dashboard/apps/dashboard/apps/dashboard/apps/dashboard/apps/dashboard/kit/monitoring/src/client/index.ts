import * as ConsoleClient from '../provider/console/client/index';
import * as SentryClient from '../provider/sentry/client/index';
import { SupportedProviders } from '../types';

export const createRouterTransitionStartHandler = (
    provider: SupportedProviders = 'sentry',
): ((href: string, navigationType: string) => void) => {
    switch (provider) {
        case 'sentry':
            return SentryClient.handleRouterTransitionStart();
        case 'console':
            return ConsoleClient.handleRouterTransitionStart();
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
};
