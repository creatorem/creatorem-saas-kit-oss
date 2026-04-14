import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon, IconName } from '@kit/native-ui/icon';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import React, { useRef, useState } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

interface SwitchProps {
    value?: boolean;
    onChange?: (value: boolean) => void;
    label?: string;
    description?: string;
    icon?: IconName;
    disabled?: boolean;
    className?: string;
}

const Switch: React.FC<SwitchProps> = ({
    value,
    onChange,
    label,
    description,
    icon,
    disabled = false,
    className = '',
}) => {
    const colors = useThemeColors();
    const [isOn, setIsOn] = useState(value ?? false);
    const slideAnim = useRef(new Animated.Value((value ?? false) ? 1 : 0)).current;

    // Handle controlled vs uncontrolled state
    const isControlled = value !== undefined;
    const switchValue = isControlled ? value : isOn;

    const toggleSwitch = () => {
        if (disabled) return;

        const newValue = !switchValue;

        // Update internal state if uncontrolled
        if (!isControlled) {
            setIsOn(newValue);
        }

        // Call callback if provided
        onChange?.(newValue);

        // Animate the switch
        Animated.spring(slideAnim, {
            toValue: newValue ? 1 : 0,
            useNativeDriver: true,
            bounciness: 4,
            speed: 12,
        }).start();
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleSwitch}
            disabled={disabled}
            className={cn('flex-row items-center py-1', disabled ? 'opacity-100' : '', className)}
        >
            {icon && (
                <View className="mr-3">
                    <Icon name={icon} size={20} color={colors['--color-foreground']} />
                </View>
            )}

            <View className="flex-1">
                {label && <Text className="text-lg font-medium">{label}</Text>}
                {description && <Text className="text-muted-foreground text-base">{description}</Text>}
            </View>

            <View className="h-6 w-10 rounded-full">
                <View className={cn('absolute h-full w-full rounded-full', switchValue ? 'bg-primary' : 'bg-muted')} />
                <Animated.View
                    style={{
                        transform: [
                            {
                                translateX: slideAnim.interpolate({
                                    inputRange: [0, 1.2],
                                    outputRange: [1, 21],
                                }),
                            },
                        ],
                    }}
                    className="my-0.5 h-5 w-5 rounded-full bg-white shadow-sm dark:bg-white"
                />
            </View>
        </TouchableOpacity>
    );
};

export default Switch;
