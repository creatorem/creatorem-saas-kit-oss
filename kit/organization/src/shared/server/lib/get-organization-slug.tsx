import 'server-only';

import { logger } from '@kit/utils';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

export const getOrganizationSlug = cache(async (): Promise<string> => {
    const headersList = await headers();
    const organizationSlug = headersList.get('x-organization-slug');

    if (!organizationSlug) {
        // Instead of not-found we can just redirect.
        logger.error('No organization slug in headers. Check proxy.');
        return redirect('/');
    }

    return organizationSlug;
});
