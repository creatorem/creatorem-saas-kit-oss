import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

interface CounterProps {
    label: string;
    value?: number;
    onChange?: (value: number | undefined) => void;
    min?: number;
    max?: number;
    className?: string;
}

export default function Counter({
    label,
    value: controlledValue,
    onChange,
    min = 0,
    max = 99,
    className,
}: CounterProps) {
    const [internalValue, setInternalValue] = useState<number | undefined>(undefined);

    // Handle controlled and uncontrolled modes
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const handleChange = (newValue: number | undefined) => {
        if (!isControlled) {
            setInternalValue(newValue);
        }
        onChange?.(newValue);
    };

    const increment = () => {
        if (value === undefined) {
            handleChange(1);
        } else if (value < max) {
            handleChange(value + 1);
        }
    };

    const decrement = () => {
        if (value === 1) {
            handleChange(undefined);
        } else if (value !== undefined && value > min) {
            handleChange(value - 1);
        }
    };

    return (
        <View className={cn('w-full', className)}>
            <View className="w-full flex-row items-center justify-between">
                <Text className="flex-1 text-lg">{label}</Text>
                <View className="bg-secondary min-w-[140px] flex-row items-center justify-between overflow-hidden rounded-full p-1">
                    <Pressable
                        onPress={decrement}
                        className="bg-background h-8 w-8 items-center justify-center rounded-full"
                    >
                        <Text className="text-xl">-</Text>
                    </Pressable>

                    <View className="items-center justify-center px-4">
                        <Text className="text-lg font-medium">{value === undefined ? 'Any' : value}</Text>
                    </View>

                    <Pressable
                        onPress={increment}
                        className="bg-background h-8 w-8 items-center justify-center rounded-full"
                    >
                        <Text className="text-xl">+</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
