import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon } from '@kit/native-ui/icon';
import { useTheme } from '@kit/native-ui/theme-provider';
import { cn } from '@kit/utils';
import React, { useRef, useState } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

interface ThemeToggleProps {
    value?: boolean;
    onChange?: (value: boolean) => void;
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ value, onChange, className = '' }) => {
    const { isDark, toggleTheme } = useTheme();
    const colors = useThemeColors();
    const slideAnim = useRef(new Animated.Value(value !== undefined ? (value ? 6 : 6) : isDark ? 6 : 6)).current;
    const [isAnimating, setIsAnimating] = useState(false);

    const handlePress = () => {
        if (isAnimating) return;
        setIsAnimating(true);

        const newValue = value !== undefined ? !value : !isDark;

        if (onChange) {
            onChange(newValue);
        } else {
            toggleTheme();
        }

        // Animate the switch
        Animated.spring(slideAnim, {
            toValue: newValue ? 6 : 0.5,
            useNativeDriver: true,
            bounciness: 4,
            speed: 12,
        }).start(() => setIsAnimating(false));
    };

    const isActive = value !== undefined ? value : isDark;

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePress}
            className={cn('flex-row items-center py-1', className)}
        >
            <View className="h-10 w-20 flex-row items-center justify-between rounded-full">
                <View className="bg-secondary absolute h-full w-full rounded-full" />

                {/* Sun icon on left */}
                <View className="z-10 ml-1 h-8 w-8 items-center justify-center">
                    <Icon
                        name="Sun"
                        size={16}
                        color={isActive ? colors['--color-opposite'] : colors['--color-foreground']}
                    />
                </View>

                {/* Moon icon on right */}
                <View className="z-10 mr-1 h-8 w-8 items-center justify-center">
                    <Icon
                        name="Moon"
                        size={16}
                        color={!isActive ? colors['--color-opposite'] : colors['--color-foreground']}
                    />
                </View>

                {/* Animated thumb */}
                <Animated.View
                    style={{
                        transform: [
                            {
                                translateX: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 7],
                                }),
                            },
                        ],
                        position: 'absolute',
                        left: 1,
                    }}
                >
                    <View className="bg-background my-0.5 h-8 w-8 rounded-full shadow-sm" />
                </Animated.View>
            </View>
        </TouchableOpacity>
    );
};

export default ThemeToggle;
