import 'client-only';

import useAnalyticsFilters from '@kit/analytics/www/use-filters';
import useMonitoringFilters from '@kit/monitoring/www/use-filters';
import useAIFilters from '@kit/ai/www/use-filters';
import { aiConfig } from '~/config/ai.config';
export const useFilters = () => {
    useAnalyticsFilters();
    useMonitoringFilters();
    useAIFilters({
        aiConfig,
    });
};
