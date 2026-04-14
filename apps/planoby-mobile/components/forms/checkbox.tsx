import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon } from '@kit/native-ui/icon';
import { Pressable } from '@kit/native-ui/react-native';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import React from 'react';
import { View } from 'react-native';

interface CheckboxProps {
    label: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    error?: string;
    className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked = false, onChange, error, className = '' }) => {
    const colors = useThemeColors();

    // Internal state if no onChange provided (for mockups)
    const [internalChecked, setInternalChecked] = React.useState(checked);

    // Use either the controlled prop or internal state
    const isChecked = onChange ? checked : internalChecked;

    const handlePress = () => {
        if (onChange) {
            onChange(!isChecked);
        } else {
            setInternalChecked(!internalChecked);
        }
    };

    return (
        <View className={cn('mb-4', className)}>
            <Pressable onPress={handlePress} className="flex-row items-center">
                <View
                    className={cn(
                        'flex h-6 w-6 items-center justify-center rounded border',
                        isChecked ? 'bg-primary border-primary' : 'border-black/40 dark:border-white/40',
                        error && 'border-red-500',
                    )}
                >
                    {isChecked && (
                        <View className="bg-primary border-background h-full w-full items-center justify-center rounded border-[2px]">
                            <Icon name="Check" size={14} color="#fff" />
                        </View>
                    )}
                </View>
                <Text className="ml-2">{label}</Text>
            </Pressable>

            {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
        </View>
    );
};

export default Checkbox;
