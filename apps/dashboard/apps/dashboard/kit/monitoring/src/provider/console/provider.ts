import type { AbstractMonitoringProvider, ErrorContext, ErrorRequest } from '../../types';

export class ConsoleMonitoringProvider implements AbstractMonitoringProvider {
    public withConfig<C>(nextConfig: C): C {
        return nextConfig;
    }

    public async register(): Promise<void> {
        console.info(`[Console Monitoring] Provider initialized successfully`);
    }

    public captureRequestError(
        error: unknown,
        errorRequest: Readonly<ErrorRequest>,
        errorContext: Readonly<ErrorContext>,
    ): void {
        console.error('[Console Monitoring] HTTP request failed with error');

        // Log error details if available
        this.captureError(error);

        // Log request details if available
        if (errorRequest) {
            console.info('[Console Monitoring] Failed request metadata:', {
                path: errorRequest.path,
                method: errorRequest.method,
                headers: errorRequest.headers,
            });
        }

        // Log context details if available
        if (errorContext) {
            console.info('[Console Monitoring] Route context information:', {
                routerKind: errorContext.routerKind,
                routePath: errorContext.routePath,
                routeType: errorContext.routeType,
                renderSource: errorContext.renderSource || 'Not specified',
                revalidateReason: errorContext.revalidateReason ?? 'Not specified',
            });
        }
    }

    public captureError<Extra extends object>(error: unknown, extra?: Extra): void {
        if (error instanceof Error) {
            console.error('[Console Monitoring] Application error detected:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                additionalData: extra,
            });
        } else if (typeof error === 'string') {
            console.error('[Console Monitoring] String error message:', error, extra);
        } else if (error) {
            console.error('[Console Monitoring] Non-standard error object:', JSON.stringify(error), extra);
        }
    }

    public captureEvent<Extra extends object>(event: string, extra?: Extra): void {
        console.info(`[Console Monitoring] Custom event logged:`, { event, additionalData: extra });
    }

    public setUser<Info extends { id: string }>(user: Info): void {
        console.info(`[Console Monitoring] User session established:`, user);
    }
}
