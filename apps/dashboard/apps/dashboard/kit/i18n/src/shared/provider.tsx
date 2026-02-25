'use client';

import type { i18n as I18nInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { I18nConfig } from '../config';
import { createI18nInstance } from './instance';

let i18nInstance: I18nInstance | null = null;

export function I18nProvider({
    children,
    config,
    lang,
}: React.PropsWithChildren<{
    config: I18nConfig;
    lang?: string;
}>) {
    const i18n = useI18nClient(config, lang);

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

function useI18nClient(config: I18nConfig, lang?: string) {
    if (!i18nInstance || i18nInstance.language !== lang) {
        // This throws a Promise, which React catches and suspends
        throw loadI18nInstance(config, lang);
    }

    return i18nInstance;
}

async function loadI18nInstance(config: I18nConfig, lang?: string) {
    i18nInstance = await createI18nInstance(config, lang);
}
