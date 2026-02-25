import 'client-only';

import { useOnboardingFilters } from './use-filters/use-onboarding-filters';
import { useProviderFilters } from './use-filters/use-provider-filters';
import { useSettingsFilters } from './use-filters/use-settings-filters';
import { useTranslationFilters } from './use-filters/use-translation-filters';
import { useUiFilters } from './use-filters/use-ui-filters';
import { organizationRouter } from '../../router/router';
import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';

export default function useOrganizationFilters(opts: { clientTrpc: TrpcClientWithQuery<typeof organizationRouter> }) {
    useOnboardingFilters();
    useSettingsFilters();
    useUiFilters();
    useProviderFilters(opts);
    useTranslationFilters();
}
