'use client';

import { BillingConfig } from '@kit/billing';
import { useSettingsFilters } from './use-filters/use-settings-filters';

export default function useBillingFilters({
    billingConfig,
}: {
    billingConfig: BillingConfig;
}) {
    useSettingsFilters({ billingConfig });
}
