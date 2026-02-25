import { type AsyncFilterCallback, enqueueCrossEnvFilter, type FilterCallback } from '@kit/utils/filters/cross-env';
import { I18N_ORGANIZATION_NAMESPACES } from '../../i18n/i18n.namespaces';

const ADD_ORG_TRANSLATIONS = 'addOrgTranslations';
const addOrgTranslations: AsyncFilterCallback<'cross_env_get_translations'> = async (_, { language, namespace }) => {
    if (I18N_ORGANIZATION_NAMESPACES.includes(namespace as 'p_org')) {
        const data = await import(`../../i18n/locales/${language}/${namespace}.json`);
        return data as Record<string, string>;
    }
    return _;
};

const ADD_ORG_NS = 'addOrgNs';
const addOrgNs: FilterCallback<'cross_env_get_namespaces'> = (ns) => {
    return [...ns, ...I18N_ORGANIZATION_NAMESPACES];
};

export default function () {
    enqueueCrossEnvFilter('cross_env_get_translations', {
        name: ADD_ORG_TRANSLATIONS,
        fn: addOrgTranslations,
        async: true,
    });

    enqueueCrossEnvFilter('cross_env_get_namespaces', {
        name: ADD_ORG_NS,
        fn: addOrgNs,
    });
}
