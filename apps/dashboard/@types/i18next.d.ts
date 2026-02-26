// import the original type declarations
import 'i18next';

import enAi from '../../../kit/ai/src/i18n/locales/en/p_ai.json';
import { enAuth } from '../../../kit/auth/src/i18n/locales/en/p_auth.json';
import aiContent from '../public/locales/en/ai-content.json';
import dashboard from '../public/locales/en/dashboard.json';
import settings from '../public/locales/en/settings.json';
import tour from '../public/locales/en/tour.json';

declare module 'i18next' {
    // Extend CustomTypeOptions
    interface CustomTypeOptions {
        // custom namespace type, if you changed it
        defaultNS: 'dashboard';
        // custom resources type
        resources: {
            p_auth: typeof enAuth;
            p_ai: typeof enAi;
            dashboard: typeof dashboard;
            'ai-content': typeof aiContent;
            tour: typeof tour;
            settings: typeof settings;
        };
        // other
    }
}
