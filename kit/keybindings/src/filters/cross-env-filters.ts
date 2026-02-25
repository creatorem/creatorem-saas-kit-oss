import { type AsyncFilterCallback, enqueueCrossEnvFilter, type FilterCallback } from '@kit/utils/filters/cross-env';
import { I18N_KEYBINDINGS_NAMESPACES } from '../i18n/i18n.namespaces';

const ADD_KEYBINDINGS_TRANSLATIONS = 'addKeybindingsTranslations';
const addKeybindingsTranslations: AsyncFilterCallback<'cross_env_get_translations'> = async (
    _,
    { language, namespace },
) => {
    if (I18N_KEYBINDINGS_NAMESPACES.includes(namespace as 'p_keybindings')) {
        const data = await import(`../i18n/locales/${language}/${namespace}.json`);
        return data as Record<string, string>;
    }
    return _;
};

const ADD_KEYBINDINGS_NS = 'addKeybindingsNs';
const addKeybindingsNs: FilterCallback<'cross_env_get_namespaces'> = (ns) => {
    return [...ns, ...I18N_KEYBINDINGS_NAMESPACES];
};

export default function () {
    enqueueCrossEnvFilter('cross_env_get_translations', {
        name: ADD_KEYBINDINGS_TRANSLATIONS,
        fn: addKeybindingsTranslations,
        async: true,
    });

    enqueueCrossEnvFilter('cross_env_get_namespaces', {
        name: ADD_KEYBINDINGS_NS,
        fn: addKeybindingsNs,
    });
}
