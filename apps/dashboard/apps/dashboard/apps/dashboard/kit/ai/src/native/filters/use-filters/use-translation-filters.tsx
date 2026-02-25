'use client';

import { AsyncFilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { I18N_AI_NAMESPACES } from '../../../i18n/i18n.namespaces';
import enAI from '../../../i18n/locales/en/p_ai.json';
import frAI from '../../../i18n/locales/fr/p_ai.json';

const translations = {
    en: {
        p_ai: enAI,
    },
    fr: {
        p_ai: frAI,
    },
};

const ADD_AI_TRANSLATIONS = 'addIATranslations';
const addIATranslations: AsyncFilterCallback<'get_translations'> = async (_, { language, namespace }) => {
    if (I18N_AI_NAMESPACES.includes(namespace as 'p_ai')) {
        const lang = (language in translations ? language : 'en') as keyof typeof translations;

        const ns = (
            (namespace as (typeof I18N_AI_NAMESPACES)[number]) in translations[lang] ? namespace : 'p_ai'
        ) as (typeof I18N_AI_NAMESPACES)[number];

        return translations?.[lang]?.[ns] ? (translations[lang][ns] as unknown as Record<string, string>) : _;
    }
    return _;
};

/**
 * Enqueue all app events that need useOrganization to work.
 */
export function useTranslationFilters() {
    useEnqueueFilter('get_translations', {
        name: ADD_AI_TRANSLATIONS,
        fn: addIATranslations,
        async: true,
    });
}
