'use client';

import { replaceOrgSlug } from '@kit/utils/config';
import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { useCallback } from 'react';
import { useOrganization } from '../../shared';
import { useSharedFiltersWithOrganization } from '../../shared/filters/use-filters-with-organization';

/**
 * Enqueue all app events that need useOrganization to work.
 */
export const useFiltersWithOrganization = () => {
    const { organization } = useOrganization();

    useSharedFiltersWithOrganization();

    const REPLACE_ORG_IN_URL_NAME = 'replaceOrgInUrl';
    const replaceOrgInUrl: FilterCallback<'get_url_updater'> = useCallback(
        () => (url) => replaceOrgSlug(url, organization.slug),
        [organization],
    );

    useEnqueueFilter('get_url_updater', { name: REPLACE_ORG_IN_URL_NAME, fn: replaceOrgInUrl });
};
