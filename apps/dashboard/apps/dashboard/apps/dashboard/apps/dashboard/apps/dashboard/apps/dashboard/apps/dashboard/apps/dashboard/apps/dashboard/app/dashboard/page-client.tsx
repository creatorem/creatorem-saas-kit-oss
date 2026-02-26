'use client';

import { FilterApplier } from '@kit/utils/filters';
import { clientTrpc } from '~/trpc/client';

/**
 * We need this client component because `clientTrpc` is 'client only'
 */
export function ClientDashboardPage() {
    return (
        <FilterApplier name="display_root_dashboard_page" options={{ clientTrpc }}>
            By default this content isn't reached. Otherwise implement your custom logic here.
        </FilterApplier>
    );
}
