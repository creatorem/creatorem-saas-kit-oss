interface TrackEvent {
    trackEvent(eventName: string, eventProperties?: Record<string, string | string[]>): Promise<unknown>;
}

interface TrackPageView {
    trackPageView(path: string): Promise<unknown>;
}

interface Identify {
    identify(userId: string, traits?: Record<string, string>): Promise<unknown>;
}

export interface AnalyticsEngine extends TrackPageView, TrackEvent, Identify {
    initialize(): Promise<unknown>;
}

export type AnalyticsProviderFactory<Config extends object> = (config?: Config) => AnalyticsEngine;

export interface CreateAnalyticsManagerOptions<T extends string, Config extends object> {
    providers: Record<T, AnalyticsProviderFactory<Config>>;
}

export interface AnalyticsManager extends TrackPageView, TrackEvent, Identify {}
