import { parseI18nConfig } from '@kit/i18n/config';
import { DEFAULT_LANG, SUPPORTED_LANGS } from '@planoby/shared/config/defined-languages';
import { applyAsyncFilter } from '@kit/utils/filters';
import enCommon from '../locales/en/common.json';
import enNotification from '../locales/en/notification.json';
import enSettings from '../locales/en/settings.json';
import frCommon from '../locales/fr/common.json';
import frNotification from '../locales/fr/notification.json';
import frSettings from '../locales/fr/settings.json';

const translations = {
    en: {
        common: enCommon,
        notification: enNotification,
        settings: enSettings,
    },
    fr: {
        common: frCommon,
        notification: frNotification,
        settings: frSettings,
    },
};

async function i18nResolver(language: keyof typeof translations, namespace: string): Promise<Record<string, string>> {
    const packageTranslations = await applyAsyncFilter('get_translations', null, {
        language,
        namespace,
    });
    if (packageTranslations) {
        return packageTranslations;
    }

    const lang = language in translations ? language : 'en';
    const ns = (namespace in translations[lang] ? namespace : 'common') as keyof (typeof translations)[typeof lang];

    return translations[lang][ns] as Record<string, string>;
}

export const i18nConfig = parseI18nConfig({
    defaultLanguage: DEFAULT_LANG,
    languages: SUPPORTED_LANGS,
    namespaces: ['common', 'notification', 'settings', 'p_auth', 'p_org-settings', 'p_org-onboarding'],
    resolver: i18nResolver as (lang: string, namespace: string) => Promise<Record<string, string>>,
});
