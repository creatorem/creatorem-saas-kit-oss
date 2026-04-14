import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon } from '@kit/native-ui/icon';
import { InputVariant } from '@kit/native-ui/input';
import { Text } from '@kit/native-ui/text';
import { useTheme } from '@kit/native-ui/theme-provider';
import { cn } from '@kit/utils';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useRef, useState } from 'react';
import { Animated, Platform, Pressable, TouchableOpacity, View } from 'react-native';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';

interface SelectOption {
    label: string;
    value: string | number;
}

interface SelectProps {
    label?: string;
    placeholder?: string;
    options: SelectOption[];
    value?: string | number;
    onChange: (value: string | number) => void;
    error?: string;
    className?: string;
    variant?: InputVariant;
}

const Select: React.FC<SelectProps> = ({
    label,
    placeholder = '',
    options,
    value,
    onChange,
    error,
    className,
    variant = 'animated',
}) => {
    const { isDark } = useTheme();
    const colors = useThemeColors();
    const actionSheetRef = useRef<ActionSheetRef>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedOption, setSelectedOption] = useState<SelectOption | undefined>(
        options.find((option) => option.value === value),
    );

    React.useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setBackgroundColorAsync(colors['--color-background']);
            NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');

            return () => {
                // Reset to default theme color when component unmounts
                NavigationBar.setBackgroundColorAsync(colors['--color-background']);
                NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
            };
        }
    }, [colors, isDark]);

    const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    React.useEffect(() => {
        if (variant !== 'classic') {
            Animated.timing(animatedLabelValue, {
                toValue: isFocused || selectedOption ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    }, [isFocused, selectedOption, animatedLabelValue, variant]);

    const labelStyle = {
        top: animatedLabelValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, -8],
        }),
        fontSize: animatedLabelValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        }),
        color: animatedLabelValue.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.placeholder, colors['--color-foreground']],
        }),
        left: 12,
        paddingHorizontal: 8,
    };

    const underlinedLabelStyle = {
        top: animatedLabelValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, -8],
        }),
        fontSize: animatedLabelValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        }),
        color: animatedLabelValue.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.placeholder, colors['--color-foreground']],
        }),
        left: 0,
        paddingHorizontal: 0,
    };

    const handleSelect = (option: SelectOption) => {
        setSelectedOption(option);
        onChange(option.value);
        actionSheetRef.current?.hide();
    };

    const handlePress = () => {
        setIsFocused(true);
        actionSheetRef.current?.show();
    };

    const handleClose = () => {
        setIsFocused(false);
    };

    // Render the action sheet
    const renderActionSheet = () => (
        <ActionSheet
            ref={actionSheetRef}
            onClose={handleClose}
            isModal={true}
            enableGesturesInScrollView={true}
            statusBarTranslucent={true}
            drawUnderStatusBar={false}
            containerStyle={{
                backgroundColor: colors['--color-background'],
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
            }}
            animated={true}
            openAnimationConfig={{
                stiffness: 3000,
                damping: 500,
                mass: 3,
                overshootClamping: true,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01,
            }}
            closeAnimationConfig={{
                stiffness: 1000,
                damping: 500,
                mass: 3,
                overshootClamping: true,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01,
            }}
        >
            <View className="p-4">
                {options.map((option) => (
                    <Pressable
                        key={option.value}
                        onPress={() => handleSelect(option)}
                        className={cn(
                            'mb-2 rounded-lg px-4 py-3',
                            selectedOption?.value === option.value ? 'bg-secondary' : '',
                        )}
                    >
                        <Text>{option.label}</Text>
                    </Pressable>
                ))}
            </View>
        </ActionSheet>
    );

    // Classic variant
    if (variant === 'classic') {
        return (
            <View className={cn('mb-4', className)}>
                {label && <Text className="mb-1 font-medium">{label}</Text>}
                <View className="relative">
                    <TouchableOpacity
                        onPress={handlePress}
                        className={cn(
                            'h-14 w-full flex-row items-center justify-between rounded-lg border bg-transparent px-4 py-3',
                            isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60',
                            error ? 'border-red-500' : '',
                        )}
                    >
                        <Text className={selectedOption ? '' : 'text-muted-foreground'}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </Text>
                        <Icon name="ChevronDown" size={20} />
                    </TouchableOpacity>
                </View>
                {error && <Text className="mt-1 text-base text-red-500">{error}</Text>}
                {renderActionSheet()}
            </View>
        );
    }

    // Underlined variant
    if (variant === 'underlined') {
        return (
            <View className={cn('mb-4', className)}>
                <View className="relative">
                    <Pressable className="bg-background z-40 px-0" onPress={handlePress}>
                        <Animated.Text
                            style={[underlinedLabelStyle]}
                            className="bg-background text-foreground absolute z-50"
                        >
                            {label}
                        </Animated.Text>
                    </Pressable>
                    <TouchableOpacity
                        onPress={handlePress}
                        className={cn(
                            'h-14 w-full flex-row items-center justify-between border-t-0 border-r-0 border-b-2 border-l-0 bg-transparent px-0 py-3',
                            isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60',
                            error ? 'border-red-500' : '',
                        )}
                    >
                        <Text className={selectedOption ? '' : 'text-muted-foreground'}>
                            {selectedOption ? selectedOption.label : ''}
                        </Text>
                        <Icon name="ChevronDown" size={20} />
                    </TouchableOpacity>
                </View>
                {error && <Text className="mt-1 text-base text-red-500">{error}</Text>}
                {renderActionSheet()}
            </View>
        );
    }

    // Default animated variant
    return (
        <View className={`mb-4 ${className || ''}`}>
            <View className="relative">
                <Pressable className="bg-background z-40 px-1" onPress={handlePress}>
                    <Animated.Text style={[labelStyle]} className="bg-background text-foreground absolute z-50 px-1">
                        {label}
                    </Animated.Text>
                </Pressable>
                <TouchableOpacity
                    onPress={handlePress}
                    className={cn(
                        'h-14 w-full flex-row items-center justify-between rounded-lg border bg-transparent px-4 py-3',
                        isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60',
                        error ? 'border-red-500' : '',
                    )}
                >
                    <Text className={selectedOption ? '' : 'text-muted-foreground'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </Text>
                    <Icon name="ChevronDown" size={20} />
                </TouchableOpacity>
            </View>
            {error && <Text className="mt-1 text-base text-red-500">{error}</Text>}
            {renderActionSheet()}
        </View>
    );
};

export default Select;
