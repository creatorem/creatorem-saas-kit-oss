import { createGoogleAnalyticsEngine } from '@kit/google-analytics';
import { createUmamiAnalyticsEngine } from '@kit/umami';

export const analyticProviders = {
    google: () => createGoogleAnalyticsEngine(),
    umami: () => createUmamiAnalyticsEngine(),
};
