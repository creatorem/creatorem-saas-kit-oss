import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useLangUrl = () => {
    const { i18n } = useTranslation();

    const addContextToUrl = useCallback((url: string) => {
        const lang = i18n.language;
        if (url.includes('[lang]')) {
            return url.replace('[lang]', lang);
        }
        return url;
    }, []);

    return { url: addContextToUrl };
};
