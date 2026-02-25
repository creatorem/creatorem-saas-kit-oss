'use client';

import { BillingConfig } from '@kit/billing';
import { useSettingsFilters } from './use-filters/use-settings-filters';
import { AiConfig } from '../../config';

export default function useAiFilters({
    billingConfig,
    aiConfig,
}: {
    billingConfig?: BillingConfig;
    aiConfig: AiConfig;
}) {
    useSettingsFilters({ billingConfig, aiConfig });
}
