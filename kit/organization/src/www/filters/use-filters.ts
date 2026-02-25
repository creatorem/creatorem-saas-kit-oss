'use client';

import { OrgConfig } from '../../config';
import { useAuthFilters } from './use-filters/use-auth-filters';
import { useOnboardingFilters } from './use-filters/use-onboarding-filters';
import { useProviderFilters } from './use-filters/use-provider-filters';
import { useSettingsFilters } from './use-filters/use-settings-filters';
import { useUiFilters } from './use-filters/use-ui-filters';

export default function useOrganizationFilters(opts: { orgConfig: OrgConfig }) {
    useOnboardingFilters(opts);
    useSettingsFilters();
    useUiFilters(opts);
    useAuthFilters();
    useProviderFilters(opts);
}
