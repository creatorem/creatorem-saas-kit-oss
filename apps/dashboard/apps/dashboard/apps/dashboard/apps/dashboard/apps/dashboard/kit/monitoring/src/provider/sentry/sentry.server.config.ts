import { envs } from '@kit/monitoring/envs';
import { init } from '@sentry/nextjs';

type Parameters<T extends (args: never) => unknown> = T extends (...args: infer P) => unknown ? P : never;

export function initSentryServerConfig(props: Parameters<typeof init>[0] = {}) {
    return init({
        dsn: envs().NEXT_PUBLIC_SENTRY_DSN,
        // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
        tracesSampleRate: props?.tracesSampleRate ?? 1.0,

        // Enable logs to be sent to Sentry
        enableLogs: true,

        // Setting this option to true will print useful information to the console while you're setting up Sentry.
        debug: false,
        ...props,
    });
}
