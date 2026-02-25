import 'server-only';

import { getDBClient } from '@kit/shared/server/get-db-client';
import { applyServerAsyncFilter } from '@kit/utils/filters/server';
import { initServerFilters } from './init-server-filters';

export const getAppUrl = async (url: string) => {
    initServerFilters();
    const finalUrl = await applyServerAsyncFilter('server_get_url', url);
    if (!finalUrl.includes('[slug]')) return finalUrl;

    const db = await getDBClient();
    const user = await db.user.require();
    return finalUrl.replace('[slug]', user.id);
};
