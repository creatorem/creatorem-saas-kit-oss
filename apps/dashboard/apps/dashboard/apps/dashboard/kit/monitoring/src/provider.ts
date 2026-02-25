import { getProvider } from './get-provider';
import type { AbstractMonitoringProvider, ErrorContext, ErrorRequest, SupportedProviders } from './types';

class MonitoringProviderClass implements AbstractMonitoringProvider {
    public provider: SupportedProviders;

    // the console provider is just a mock provider
    // for now, we only support sentry
    constructor(provider?: SupportedProviders) {
        this.provider = provider ?? 'sentry';
    }

    public withConfig<C>(nextConfig: C): C {
        const provider = getProvider(this.provider);
        return provider.withConfig(nextConfig);
    }

    public async register(): Promise<void> {
        const provider = getProvider(this.provider);
        return await provider.register();
    }

    public async captureRequestError(
        error: unknown,
        errorRequest: Readonly<ErrorRequest>,
        errorContext: Readonly<ErrorContext>,
    ): Promise<void> {
        const provider = getProvider(this.provider);
        return await provider.captureRequestError(error, errorRequest, errorContext);
    }

    public captureError<Extra extends object>(error: unknown, extra?: Extra): void {
        const provider = getProvider(this.provider);
        return provider.captureError(error, extra);
    }

    public captureEvent<Extra extends object>(event: string, extra?: Extra): void {
        const provider = getProvider(this.provider);
        return provider.captureEvent(event, extra);
    }

    public setUser<Info extends { id: string }>(user: Info): void {
        const provider = getProvider(this.provider);
        return provider.setUser(user);
    }
}

export const MonitoringProvider = new MonitoringProviderClass('sentry');
