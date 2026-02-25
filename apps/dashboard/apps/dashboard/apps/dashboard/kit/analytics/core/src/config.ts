import { NullAnalyticsEngine } from './null-analytics-service';
import { analyticProviders } from './providers';
import type { AnalyticsEngine, AnalyticsManager } from './types';

const registerActiveEngines = (slugs: (keyof typeof analyticProviders)[]) => {
    const activeEngines = new Map<keyof typeof analyticProviders, AnalyticsEngine>();

    slugs.forEach((providerSlug) => {
        const analyticEngine = analyticProviders[providerSlug];

        if (!analyticEngine) {
            console.warn(`Analytics provider '${providerSlug}' not registered. Skipping initialization.`);

            return;
        }

        const service = analyticEngine();
        activeEngines.set(providerSlug, service);

        void service.initialize();
    });

    return activeEngines;
};

export function createAnalyticsManager(providerSlugs: (keyof typeof analyticProviders)[]): AnalyticsManager {
    const activeEngines = registerActiveEngines(providerSlugs);

    const getActiveEngines = (): AnalyticsEngine[] => {
        if (activeEngines.size === 0) {
            console.debug('No active analytics services. Using NullAnalyticsEngine.');

            return [NullAnalyticsEngine];
        }

        return Array.from(activeEngines.values());
    };

    return {
        identify: (userId: string, traits?: Record<string, string>) => {
            return Promise.all(getActiveEngines().map((service) => service.identify(userId, traits)));
        },

        trackPageView: (path: string) => {
            return Promise.all(getActiveEngines().map((service) => service.trackPageView(path)));
        },

        trackEvent: (eventName: string, eventProperties?: Record<string, string | string[]>) => {
            console.log('trackEvent in analytics-manager.ts', eventName, eventProperties);
            return Promise.all(getActiveEngines().map((service) => service.trackEvent(eventName, eventProperties)));
        },
    };
}
