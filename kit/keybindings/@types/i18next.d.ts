// import the original type declarations
import 'i18next';

import enKeybindings from '../src/i18n/locales/en/p_keybindings.json';

declare module 'i18next' {
    // Extend CustomTypeOptions
    interface CustomTypeOptions {
        // custom namespace type, if you changed it
        defaultNS: 'other';
        // custom resources type
        resources: {
            p_keybindings: typeof enKeybindings;
        };
    }
}
