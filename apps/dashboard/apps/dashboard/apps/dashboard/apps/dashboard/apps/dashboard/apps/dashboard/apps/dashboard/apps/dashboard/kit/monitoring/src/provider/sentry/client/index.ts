import * as Sentry from '@sentry/nextjs';
import { initSentryClientConfig } from './sentry.client.config';

export const handleRouterTransitionStart = (): ((href: string, navigationType: string) => void) => {
    initSentryClientConfig();
    return Sentry.captureRouterTransitionStart;
};
