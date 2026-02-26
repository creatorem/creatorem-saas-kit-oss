import { envs } from '@kit/monitoring/envs';
import { init, replayIntegration } from '@sentry/nextjs';

type Parameters<T extends (args: never) => unknown> = T extends (...args: infer P) => unknown ? P : never;

export function initSentryClientConfig(props: Parameters<typeof init>[0] = {}) {
    return init({
        dsn: envs().NEXT_PUBLIC_SENTRY_DSN,
        integrations: [
            // https://docs.sentry.io/platforms/javascript/configuration/integrations/
            replayIntegration(),
        ],

        // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
        tracesSampleRate: props?.tracesSampleRate ?? 1.0,
        // Enable logs to be sent to Sentry
        enableLogs: true,

        // Define how likely Replay events are sampled.
        // This sets the sample rate to be 10%. You may want this to be 100% while
        // in development and sample at a lower rate in production
        replaysSessionSampleRate: 0.1,

        // Define how likely Replay events are sampled when an error occurs.
        replaysOnErrorSampleRate: 1.0,

        // Setting this option to true will print useful information to the console while you're setting up Sentry.
        debug: false,
        ...props,
    });
}
