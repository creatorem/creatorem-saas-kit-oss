'use client';

import { useSharedFiltersWithOrganization } from '../../shared/filters/use-filters-with-organization';

/**
 * Enqueue all app events that need useOrganization to work.
 */
export const useFiltersWithOrganization = useSharedFiltersWithOrganization;
