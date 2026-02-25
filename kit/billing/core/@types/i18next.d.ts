// import the original type declarations
import 'i18next';

import enBilling from '../src/i18n/locales/en/p_billing.json';

declare module 'i18next' {
    // Extend CustomTypeOptions
    interface CustomTypeOptions {
        // custom namespace type, if you changed it
        defaultNS: 'p_billing';
        // custom resources type
        resources: {
            p_billing: typeof enBilling;
        };
    }
}
