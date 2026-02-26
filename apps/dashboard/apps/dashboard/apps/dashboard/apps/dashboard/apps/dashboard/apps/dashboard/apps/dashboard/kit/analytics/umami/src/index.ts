import { envs } from '@kit/umami/envs';

declare global {
    interface Window {
        umami: {
            track: (event: string | Record<string, string>, properties?: Record<string, string>) => void;
        };
    }
}

const UMAMI_HOST = envs().NEXT_PUBLIC_UMAMI_HOST ?? 'https://cloud.umami.is/script.js';
const UMAMI_WEBSITE_ID = envs().NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const UMAMI_DISABLE_LOCALHOST_TRACKING = envs().NEXT_PUBLIC_UMAMI_DISABLE_LOCALHOST_TRACKING;

/**
 * Create a Umami analytics service.
 */
export function createUmamiAnalyticsEngine() {
    if (!UMAMI_WEBSITE_ID) {
        throw new Error(
            'UMAMI_WEBSITE_ID is not set. Please set the environment variable NEXT_PUBLIC_UMAMI_WEBSITE_ID.',
        );
    }

    return new UmamiAnalyticsEngine(
        UMAMI_WEBSITE_ID,
        UMAMI_DISABLE_LOCALHOST_TRACKING ? UMAMI_DISABLE_LOCALHOST_TRACKING === 'true' : false,
    );
}

/**
 * Umami analytics service that sends events to Umami.
 */
class UmamiAnalyticsEngine {
    private userId: string | undefined;
    private initialized = false;

    constructor(
        // private readonly host: string,
        private readonly websiteId: string,
        disableLocalhostTracking = false,
    ) {
        if (disableLocalhostTracking) {
            this.disableLocalhostTracking();
        }
    }

    private get umami() {
        return typeof window === 'undefined' || !window.umami
            ? {
                  track: () => {
                      // Do nothing
                  },
              }
            : window.umami;
    }

    private createUmamiScript() {
        const script = document.createElement('script');

        script.src = UMAMI_HOST;
        script.async = true;
        script.defer = true;

        script.setAttribute('data-website-id', this.websiteId);

        document.head.appendChild(script);

        script.onload = () => {
            this.initialized = true;
        };
    }

    async initialize() {
        if (this.initialized || typeof window === 'undefined') {
            return Promise.resolve();
        }

        return this.createUmamiScript();
    }

    async trackPageView() {
        // Umami does this automatically
    }

    async trackEvent(eventName: string, eventProperties: Record<string, string> = {}) {
        await this.initialize();

        if (this.userId) {
            eventProperties.user_id = this.userId;
        }

        return this.umami.track(eventName, eventProperties);
    }

    async identify(userId: string) {
        await this.initialize();

        this.userId = userId;
    }

    private disableLocalhostTracking() {
        if (typeof window !== 'undefined') {
            if (window.location.hostname === 'localhost') {
                localStorage.setItem('umami.disabled', '1');
            }
        }
    }
}
