// import the original type declarations
import 'i18next';

import enAi from '../src/i18n/locales/en/p_ai.json';

declare module 'i18next' {
    // Extend CustomTypeOptions
    interface CustomTypeOptions {
        // custom namespace type, if you changed it
        defaultNS: 'p_ai';
        // custom resources type
        resources: {
            p_ai: typeof enAi;
        };
    }
}
