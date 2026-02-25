import { type AsyncFilterCallback, enqueueCrossEnvFilter, type FilterCallback } from '@kit/utils/filters/cross-env';
import { I18N_BILLING_NAMESPACES } from '../../i18n/i18n.namespaces';

const ADD_BILLING_TRANSLATIONS = 'addBillingTranslations';
const addBillingTranslations: AsyncFilterCallback<'cross_env_get_translations'> = async (
    _,
    { language, namespace },
) => {
    if (I18N_BILLING_NAMESPACES.includes(namespace as 'p_billing')) {
        const data = await import(`../../i18n/locales/${language}/${namespace}.json`);
        return data as Record<string, string>;
    }
    return _;
};

const ADD_BILLING_NS = 'addBillingNs';
const addBillingNs: FilterCallback<'cross_env_get_namespaces'> = (ns) => {
    return [...ns, ...I18N_BILLING_NAMESPACES];
};

export default function () {
    enqueueCrossEnvFilter('cross_env_get_translations', {
        name: ADD_BILLING_TRANSLATIONS,
        fn: addBillingTranslations,
        async: true,
    });

    enqueueCrossEnvFilter('cross_env_get_namespaces', {
        name: ADD_BILLING_NS,
        fn: addBillingNs,
    });
}
