import type { i18n as I18nInstance } from 'i18next';
import { I18nConfig } from '../config';
import { I18N_HEADER_NAME } from '../shared/constants';
import { createI18nInstance } from '../shared/instance';

const checkI18nInstance = (i18nInstance: I18nInstance, lng: string | null, config: I18nConfig) => {
    if (!lng && i18nInstance.resolvedLanguage !== config.defaultLanguage) {
        throw new Error('No language found in the header and the default language is not set');
    }

    if (!config.useRouting && lng && i18nInstance.resolvedLanguage !== lng) {
        throw new Error(
            `The language in the header (${lng}) is not the same as the resolved language (${i18nInstance.resolvedLanguage})`,
        );
    }

    return i18nInstance;
};

/**
 * Headers return undefined with static rendrering so we need to pass the lang from the url params.
 *
 * @param config
 * @param lang
 * @returns
 */
export async function createI18nServerInstance(config: I18nConfig, lang?: string) {
    if (config.useRouting && !lang) {
        throw new Error(
            'You must wrap each routes under [lang]/... with the withI18n hoc component. Delcared with const withI18n = getWithI18n(...) with getWithI18n exported from "@kit/i18n/server"',
        );
    }

    let lng = lang ?? null;

    if (!config.useRouting && !lng) {
        const headers = (await import('next/headers')).headers;
        const headerList = await headers();
        lng = headerList.get(I18N_HEADER_NAME);
    }

    const i18nInstance = await createI18nInstance(config, lng ?? config.defaultLanguage);

    return checkI18nInstance(i18nInstance, lng, config);
}

// export const getWithI18nHOC = (getServerI18n: (lang?: string) => Promise<I18nInstance>, config: I18nConfig) => (
export const getWithI18nHOC =
    (getServerI18n: (lang?: string) => Promise<I18nInstance>, config: I18nConfig) =>
        <P = unknown>(Component: (props: P) => Promise<unknown> | unknown) => {
            return async function WithI18nWrapper(props: P) {
                const awaitedParams = await (props as { params: Promise<{ lang: string }> }).params;
                // await getServerI18n(awaitedParams?.lang ?? config.defaultLanguage);
                const routeLang = awaitedParams?.lang;
                const safeLang = routeLang && config.languages.includes(routeLang) ? routeLang : config.defaultLanguage;
                await getServerI18n(safeLang);

                return await Component(props);
            };
        };
