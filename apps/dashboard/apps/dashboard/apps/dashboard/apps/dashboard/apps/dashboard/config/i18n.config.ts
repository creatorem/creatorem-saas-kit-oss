import { parseI18nConfig } from '@kit/i18n/config';
import { DEFAULT_LANG, SUPPORTED_LANGS } from '@kit/i18n/defined-languages';
import { applyCrossEnvAsyncFilter, applyCrossEnvFilter } from '@kit/utils/filters/cross-env';
import { initCrossEnvFilters } from '~/lib/init-cross-env-filters';

initCrossEnvFilters();

async function i18nResolver(language: string, namespace: string) {
    const serverTranslations = await applyCrossEnvAsyncFilter('cross_env_get_translations', null, {
        language,
        namespace,
    });

    if (serverTranslations) {
        return serverTranslations;
    }

    const data = await import(`../public/locales/${language}/${namespace}.json`);
    return data as Record<string, string>;
}

const ns = applyCrossEnvFilter('cross_env_get_namespaces', [
    'dashboard',
    'ai-content',
    'tour',
    'settings',
]);

export const i18nConfig = parseI18nConfig({
    defaultLanguage: DEFAULT_LANG,
    languages: SUPPORTED_LANGS,
    namespaces: ns,
    resolver: i18nResolver,
});
