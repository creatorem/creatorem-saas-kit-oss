// import the original type declarations
import 'i18next';

import enAuth from '../../auth/src/i18n/locales/en/p_auth.json';
import enOrgOnboarding from '../src/i18n/locales/en/p_org-onboarding.json';
import enOrgSettings from '../src/i18n/locales/en/p_org-settings.json';
import enOrganization from '../src/i18n/locales/en/p_org.json';

declare module 'i18next' {
    // Extend CustomTypeOptions
    interface CustomTypeOptions {
        // custom namespace type, if you changed it
        defaultNS: 'p_org';
        // custom resources type
        resources: {
            p_org: typeof enOrganization;
            'p_org-settings': typeof enOrgSettings;
            'p_org-onboarding': typeof enOrgOnboarding;
            p_auth: typeof enAuth;
        };
    }
}
