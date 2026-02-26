'use client';

import { useSettingsFilters } from './use-filters/use-settings-filters';
import { AiConfig } from '../../config';

export default function useAiFilters({ aiConfig }: { aiConfig: AiConfig }) {
    useSettingsFilters({ aiConfig });
}
