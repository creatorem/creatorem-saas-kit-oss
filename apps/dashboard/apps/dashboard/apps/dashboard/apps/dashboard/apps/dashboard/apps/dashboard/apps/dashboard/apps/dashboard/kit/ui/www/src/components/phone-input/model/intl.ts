import { DEFAULT_LANG } from './constants/lang';

export function getDisplayNames(lang = DEFAULT_LANG): Intl.DisplayNames {
    try {
        return new Intl.DisplayNames(lang, {
            type: 'region',
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(error);
        }

        return new Intl.DisplayNames(DEFAULT_LANG, {
            type: 'region',
        });
    }
}
