// import the original type declarations
import 'i18next';

// import all namespaces (for the default language, only)
import enAuth from '../../kit/auth/src/i18n/locales/en/p_auth.json';
import enOrgOnboarding from '../../kit/organization/src/i18n/locales/en/p_org-onboarding.json';
import enOrgSettings from '../../kit/organization/src/i18n/locales/en/p_org-settings.json';
import enCommon from '../locales/en/common.json';
import enNotification from '../locales/en/notification.json';
import enSettings from '../locales/en/settings.json';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        resources: {
            common: typeof enCommon;
            notification: typeof enNotification;
            settings: typeof enSettings;
            p_auth: typeof enAuth;
            'p_org-settings': typeof enOrgSettings;
            'p_org-onboarding': typeof enOrgOnboarding;
        };
    }
}
