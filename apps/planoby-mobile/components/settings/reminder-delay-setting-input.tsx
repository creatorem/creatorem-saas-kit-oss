import { Input } from '@kit/native-ui/input';
import { Text } from '@kit/native-ui/text';
import type { QuickFormInput } from '@kit/utils/quick-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { normalizeNumber, unwrapSettingValue } from './utils';

type DelayValue = {
    days: number;
    hours: number;
};

const toDelayValue = (value: unknown, fallback: DelayValue): DelayValue => {
    const parsed = unwrapSettingValue(value);

    if (!parsed || typeof parsed !== 'object') {
        return fallback;
    }

    const record = parsed as Partial<DelayValue>;

    return {
        days: typeof record.days === 'number' && Number.isFinite(record.days) ? Math.max(0, record.days) : fallback.days,
        hours:
            typeof record.hours === 'number' && Number.isFinite(record.hours)
                ? Math.max(0, Math.min(23, record.hours))
                : fallback.hours,
    };
};

export const ReminderDelaySettingInput: QuickFormInput<{
    defaultDays?: number;
    defaultHours?: number;
}> = ({ field, defaultDays = 0, defaultHours = 0 }) => {
    const { t } = useTranslation('settings');

    const value = toDelayValue(field.value, {
        days: normalizeNumber(defaultDays, 0),
        hours: normalizeNumber(defaultHours, 0),
    });

    const onChangeDays = (text: string) => {
        const next = Number.parseInt(text, 10);
        field.onChange({
            ...value,
            days: Number.isNaN(next) ? 0 : Math.max(0, next),
        });
    };

    const onChangeHours = (text: string) => {
        const next = Number.parseInt(text, 10);
        field.onChange({
            ...value,
            hours: Number.isNaN(next) ? 0 : Math.max(0, Math.min(23, next)),
        });
    };

    return (
        <View className="flex-row items-center gap-2">
            <Input
                value={String(value.days)}
                onChangeText={onChangeDays}
                editable={!field.disabled}
                keyboardType="number-pad"
                className="w-20"
            />
            <Text className="text-muted-foreground text-sm">{t('company.shared.reminder.daysAnd')}</Text>
            <Input
                value={String(value.hours)}
                onChangeText={onChangeHours}
                editable={!field.disabled}
                keyboardType="number-pad"
                className="w-20"
            />
            <Text className="text-muted-foreground text-sm">{t('company.shared.reminder.hours')}</Text>
        </View>
    );
};
