'use client';

import { AsyncFilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { I18N_ORGANIZATION_NAMESPACES } from '../../../i18n/i18n.namespaces';
import enOrganization from '../../../i18n/locales/en/p_org.json';
import enOrgOnboarding from '../../../i18n/locales/en/p_org-onboarding.json';
import enOrgSettings from '../../../i18n/locales/en/p_org-settings.json';
import frOrganization from '../../../i18n/locales/fr/p_org.json';
import frOrgOnboarding from '../../../i18n/locales/fr/p_org-onboarding.json';
import frOrgSettings from '../../../i18n/locales/fr/p_org-settings.json';

const translations = {
    en: {
        p_org: enOrganization,
        'p_org-settings': enOrgSettings,
        'p_org-onboarding': enOrgOnboarding,
    },
    fr: {
        p_org: frOrganization,
        'p_org-settings': frOrgSettings,
        'p_org-onboarding': frOrgOnboarding,
    },
};

const ADD_ORG_TRANSLATIONS = 'addOrgTranslations';
const addOrgTranslations: AsyncFilterCallback<'get_translations'> = async (_, { language, namespace }) => {
    if (I18N_ORGANIZATION_NAMESPACES.includes(namespace as 'p_org')) {
        const lang = (language in translations ? language : 'en') as keyof typeof translations;

        const ns = (
            (namespace as (typeof I18N_ORGANIZATION_NAMESPACES)[number]) in translations[lang] ? namespace : 'p_org'
        ) as (typeof I18N_ORGANIZATION_NAMESPACES)[number];

        return translations?.[lang]?.[ns] ? (translations[lang][ns] as unknown as Record<string, string>) : _;
    }
    return _;
};

/**
 * Enqueue all app events that need useOrganization to work.
 */
export function useTranslationFilters() {
    useEnqueueFilter('get_translations', {
        name: ADD_ORG_TRANSLATIONS,
        fn: addOrgTranslations,
        async: true,
    });
}
