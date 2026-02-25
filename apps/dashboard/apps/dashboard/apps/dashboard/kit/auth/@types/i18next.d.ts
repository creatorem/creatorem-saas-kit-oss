// import the original type declarations
import 'i18next';

import enAuth from '../src/i18n/locales/en/p_auth.json';

declare module 'i18next' {
    // Extend CustomTypeOptions
    interface CustomTypeOptions {
        // custom namespace type, if you changed it
        defaultNS: 'p_auth';
        // custom resources type
        resources: {
            p_auth: typeof enAuth;
        };
    }
}
