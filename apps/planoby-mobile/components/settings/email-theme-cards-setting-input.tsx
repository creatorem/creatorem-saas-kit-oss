import {
    ActionSheetSelect,
    ActionSheetSelectContent,
    ActionSheetSelectItem,
    ActionSheetSelectTrigger,
    ActionSheetSelectValue,
} from '@kit/native-ui/action-sheet-select';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import type { QuickFormInput } from '@kit/utils/quick-form';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { normalizeString } from './utils';

type ThemeOption = {
    label: string;
    value: string;
};

const THEME_COLOR_BY_VALUE: Record<string, string> = {
    default: '#FAF8F5',
    apple: '#F5F7FA',
    solid: '#111827',
    lithium: '#EEF2FF',
};

export const EmailThemeCardsSettingInput: QuickFormInput<{ options?: ThemeOption[] }> = ({ field, options }) => {
    const normalizedOptions = useMemo(() => {
        if (!Array.isArray(options) || options.length === 0) {
            return [
                { label: 'Default', value: 'default' },
                { label: 'Apple', value: 'apple' },
                { label: 'Solid', value: 'solid' },
                { label: 'Lithium', value: 'lithium' },
            ] satisfies ThemeOption[];
        }

        return options;
    }, [options]);

    const labels = useMemo(
        () => Object.fromEntries(normalizedOptions.map((option) => [option.value, option.label])),
        [normalizedOptions],
    );

    const value = normalizeString(field.value, normalizedOptions[0]?.value ?? 'default');

    return (
        <View className="gap-3">
            <ActionSheetSelect labels={labels} value={value} onValueChange={field.onChange}>
                <ActionSheetSelectTrigger>
                    <ActionSheetSelectValue />
                </ActionSheetSelectTrigger>
                <ActionSheetSelectContent>
                    {normalizedOptions.map((option) => (
                        <ActionSheetSelectItem key={option.value} value={option.value} />
                    ))}
                </ActionSheetSelectContent>
            </ActionSheetSelect>

            <View className="flex-row flex-wrap gap-2">
                {normalizedOptions.map((option) => {
                    const selected = option.value === value;
                    return (
                        <Pressable
                            key={option.value}
                            onPress={() => field.onChange(option.value)}
                            className={cn(
                                'border-border w-[48%] rounded-xl border px-3 py-3',
                                selected ? 'border-primary' : 'border-border',
                            )}
                            disabled={field.disabled}
                        >
                            <View
                                className="mb-2 h-8 rounded-md"
                                style={{ backgroundColor: THEME_COLOR_BY_VALUE[option.value] ?? '#FAF8F5' }}
                            />
                            <Text className="text-sm font-medium">{option.label}</Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};
