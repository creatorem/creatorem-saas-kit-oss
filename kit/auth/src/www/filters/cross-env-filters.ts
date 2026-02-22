import { type AsyncFilterCallback, enqueueCrossEnvFilter, type FilterCallback } from '@kit/utils/filters/cross-env';
import { I18N_AUTH_NAMESPACES } from '../../i18n/i18n.namespaces';

const ADD_AUTH_TRANSLATIONS = 'addAuthTranslations';
const addAuthTranslations: AsyncFilterCallback<'cross_env_get_translations'> = async (_, { language, namespace }) => {
    if (I18N_AUTH_NAMESPACES.includes(namespace as 'p_auth')) {
        const data = await import(`../../i18n/locales/${language}/${namespace}.json`);
        return data as Record<string, string>;
    }
    return _;
};

const ADD_AUTH_NS = 'addAuthNs';
const addAuthNs: FilterCallback<'cross_env_get_namespaces'> = (ns) => {
    return [...ns, ...I18N_AUTH_NAMESPACES];
};

export default function () {
    enqueueCrossEnvFilter('cross_env_get_translations', {
        name: ADD_AUTH_TRANSLATIONS,
        fn: addAuthTranslations,
        async: true,
    });

    enqueueCrossEnvFilter('cross_env_get_namespaces', {
        name: ADD_AUTH_NS,
        fn: addAuthNs,
    });
}
