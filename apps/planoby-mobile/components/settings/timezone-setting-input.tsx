import {
    ActionSheetSelect,
    ActionSheetSelectContent,
    ActionSheetSelectItem,
    ActionSheetSelectTrigger,
    ActionSheetSelectValue,
} from '@kit/native-ui/action-sheet-select';
import type { QuickFormInput } from '@kit/utils/quick-form';
import { useMemo } from 'react';
import { normalizeString } from './utils';

const FALLBACK_TIMEZONES = [
    'UTC',
    'Europe/Paris',
    'Europe/London',
    'Europe/Berlin',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Asia/Tokyo',
] as const;

const getSupportedTimezones = () => {
    if ('supportedValuesOf' in Intl && typeof Intl.supportedValuesOf === 'function') {
        try {
            const zones = Intl.supportedValuesOf('timeZone');
            if (zones.length > 0) {
                return zones;
            }
        } catch {
            // fall back
        }
    }

    return [...FALLBACK_TIMEZONES];
};

export const TimezoneSettingInput: QuickFormInput = ({ field, slug }) => {
    const value = normalizeString(field.value, 'UTC');

    const options = useMemo(() => {
        const zones = getSupportedTimezones();

        if (value.length > 0 && !zones.includes(value)) {
            return [value, ...zones];
        }

        return zones;
    }, [value]);

    const labels = useMemo(
        () => Object.fromEntries(options.map((timezone) => [timezone, timezone])),
        [options],
    );

    return (
        <ActionSheetSelect labels={labels} value={value} onValueChange={field.onChange}>
            <ActionSheetSelectTrigger id={slug}>
                <ActionSheetSelectValue placeholder="UTC" />
            </ActionSheetSelectTrigger>
            <ActionSheetSelectContent>
                {options.map((timezone) => (
                    <ActionSheetSelectItem key={timezone} value={timezone} />
                ))}
            </ActionSheetSelectContent>
        </ActionSheetSelect>
    );
};
