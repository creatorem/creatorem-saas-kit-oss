import type { i18n as I18nInstance, InitOptions } from 'i18next';
import { createInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';
import type { I18nConfig } from '../config';
import { I18N_COOKIE_NAME } from './constants';

/**
 * Check if the i18n instance is ready and handle infinite loop prevention.
 * @param i18next - the i18next instance
 * @param loadedLanguages - array of loaded languages
 * @param loadedNamespaces - array of loaded namespaces
 * @returns the i18next instance if ready, or throws an error
 */
function checkI18nInstance(i18next: I18nInstance, loadedLanguages: string[], loadedNamespaces: string[]): I18nInstance {
    if (loadedLanguages.length === 0 || loadedNamespaces.length === 0) {
        console.log('Keeping component from rendering if no languages or namespaces are loaded.');
        throw new Error('No languages or namespaces loaded.');
    }

    return i18next;
}

export const createI18nInstance = async ({ resolver, ...config }: I18nConfig, lang?: string) => {
    const runsOnServerSide = typeof window === 'undefined';
    const loadedLanguages: string[] = [];
    const loadedNamespaces: string[] = [];

    // const finalLang = await getActiveLang(lang, { resolver, ...config });

    const i18next = createInstance();

    await i18next
        .use(initReactI18next)
        .use(LanguageDetector)
        .use(
            resourcesToBackend(
                async (language: string, namespace: string, callback: (err: Error | null, data: object) => void) => {
                    try {
                        const data = await resolver(language, namespace);

                        if (!loadedLanguages.includes(language)) {
                            loadedLanguages.push(language);
                        }

                        if (!loadedNamespaces.includes(namespace)) {
                            loadedNamespaces.push(namespace);
                        }

                        return callback(null, data);
                    } catch (error) {
                        if (process.env.NODE_ENV === 'development') {
                            console.log(`Error loading i18n file: locales/${language}/${namespace}.json`, error);
                        }
                        return callback(null, {});
                    }
                },
            ),
        )
        .init(
            {
                // debug: true,
                supportedLngs: config.languages,
                fallbackLng: config.languages[0],
                lng: lang,
                load: 'languageOnly' as const,
                lowerCaseLng: true as const,
                fallbackNS: config.namespaces,
                missingInterpolationHandler: (text: string, value: any, options: InitOptions) => {
                    console.debug(`Missing interpolation value for key: ${text}`, value, options);
                },
                ns: config.namespaces,
                react: {
                    useSuspense: false,
                },
                detection: {
                    order: ['htmlTag', 'cookie', 'navigator'],
                    caches: ['cookie'],
                    lookupCookie: I18N_COOKIE_NAME,
                },
                interpolation: {
                    escapeValue: false,
                },
                preload: runsOnServerSide ? config.languages : false,
            },
            (err: any) => {
                if (err) {
                    console.error('Error initializing i18n client', err);
                }
            },
        );

    return checkI18nInstance(i18next, loadedLanguages, loadedNamespaces);
};
