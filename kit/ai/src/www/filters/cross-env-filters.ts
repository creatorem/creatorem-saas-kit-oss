import { type AsyncFilterCallback, enqueueCrossEnvFilter, type FilterCallback } from '@kit/utils/filters/cross-env';
import { I18N_AI_NAMESPACES } from '../../i18n/i18n.namespaces';

const ADD_AI_TRANSLATIONS = 'addAiTranslations';
const addAiTranslations: AsyncFilterCallback<'cross_env_get_translations'> = async (_, { language, namespace }) => {
    if (I18N_AI_NAMESPACES.includes(namespace as 'p_ai')) {
        const data = await import(`../../i18n/locales/${language}/${namespace}.json`);
        return data as Record<string, string>;
    }
    return _;
};

const ADD_AI_NS = 'addAiNs';
const addAiNs: FilterCallback<'cross_env_get_namespaces'> = (ns) => {
    return [...ns, ...I18N_AI_NAMESPACES];
};

export default function () {
    enqueueCrossEnvFilter('cross_env_get_translations', {
        name: ADD_AI_TRANSLATIONS,
        fn: addAiTranslations,
        async: true,
    });

    enqueueCrossEnvFilter('cross_env_get_namespaces', {
        name: ADD_AI_NS,
        fn: addAiNs,
    });
}
