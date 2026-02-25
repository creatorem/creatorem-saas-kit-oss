import { envs } from '@kit/monitoring/envs';
import * as Sentry from '@sentry/nextjs';
import type { AbstractMonitoringProvider, ErrorContext, ErrorRequest } from '../../types';

export class SentryMonitoringProvider implements AbstractMonitoringProvider {
    public withConfig<C>(nextConfig: C): C {
        return Sentry.withSentryConfig(nextConfig, {
            org: envs().SENTRY_ORG,
            project: envs().SENTRY_PROJECT,
            authToken: envs().SENTRY_AUTH_TOKEN, // Required for uploading source maps
            silent: process.env.NODE_ENV !== 'production', // Suppressing sdk build logs
            autoInstrumentServerFunctions: false,
            widenClientFileUpload: true, // Upload a larger set of source maps for prettier stack traces (increases build time)
            automaticVercelMonitors: true,
            telemetry: false,
        });
    }

    public async register(): Promise<void> {
        try {
            if (typeof window !== 'undefined') {
                const { initSentryClientConfig } = await import('./client/sentry.client.config');
                initSentryClientConfig();
            } else {
                if (process.env.NEXT_RUNTIME === 'edge') {
                    const { initSentryEdgeConfig } = await import('./sentry.edge.config');
                    initSentryEdgeConfig();
                } else {
                    const { initSentryServerConfig } = await import('./sentry.server.config');
                    initSentryServerConfig();
                }
            }
        } catch (error) {
            console.error('[Sentry Monitoring] Registration failed:', error);
        }
    }

    public async captureRequestError(
        error: unknown,
        errorRequest: Readonly<ErrorRequest>,
        errorContext: Readonly<ErrorContext>,
    ): Promise<void> {
        return Sentry.captureRequestError(error, errorRequest, errorContext);
    }

    public captureError(error: unknown): string {
        return Sentry.captureException(error);
    }

    public captureEvent<Extra extends Sentry.Event>(event: string, extra?: Extra): string {
        return Sentry.captureEvent({
            message: event,
            ...(extra ?? {}),
        });
    }

    public setUser(user: Sentry.User): void {
        Sentry.setUser(user);
    }
}
