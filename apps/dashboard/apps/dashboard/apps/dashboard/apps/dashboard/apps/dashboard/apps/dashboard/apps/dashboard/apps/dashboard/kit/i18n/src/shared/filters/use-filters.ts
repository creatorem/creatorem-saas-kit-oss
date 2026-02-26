'use client';

import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { useCallback } from 'react';
import { useLangUrl } from '../hooks/use-lang-url';

/**
 * Used to update [lang] slug in url.
 * Used in www only.
 */
export const useSharedI18nFilters = () => {
    const { url: addLangContext } = useLangUrl();

    const ADD_LANGUAGE_UPDATE = 'addLanguageUpdater';
    const addLanguageUpdater: FilterCallback<'get_url_updater'> = useCallback(
        (previousWrapper) => (url) => previousWrapper(addLangContext(url)),
        [addLangContext],
    );

    useEnqueueFilter('get_url_updater', {
        name: ADD_LANGUAGE_UPDATE,
        fn: addLanguageUpdater,
    });
};
