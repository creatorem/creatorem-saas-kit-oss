import { Button } from '@kit/native-ui/button';
import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon } from '@kit/native-ui/icon';
import { InputVariant } from '@kit/native-ui/input';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

interface TimePickerProps {
    value?: Date;
    onChange: (date: Date) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    is24Hour?: boolean;
    disabled?: boolean;
    containerClassName?: string;
    variant?: InputVariant;
}

export const TimePicker: React.FC<TimePickerProps> = ({
    value,
    onChange,
    label,
    placeholder = 'Select time',
    error,
    is24Hour = false,
    disabled = false,
    containerClassName = '',
    variant = 'animated',
}) => {
    const [isTimePickerVisible, setTimePickerVisible] = useState(false);
    const [tempDate, setTempDate] = useState<Date>(value || new Date());
    const [isFocused, setIsFocused] = useState(false);
    const colors = useThemeColors();
    const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        if (variant !== 'classic') {
            Animated.timing(animatedLabelValue, {
                toValue: isFocused || value ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    }, [isFocused, value, animatedLabelValue, variant]);

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

    const showTimePicker = () => {
        if (disabled) return;
        setIsFocused(true);
        setTimePickerVisible(true);
    };

    const hideTimePicker = () => {
        setIsFocused(false);
        setTimePickerVisible(false);
    };

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            hideTimePicker();
            if (selectedDate) {
                onChange(selectedDate);
            }
        } else {
            if (selectedDate) {
                setTempDate(selectedDate);
            }
        }
    };

    const handleConfirm = () => {
        onChange(tempDate);
        hideTimePicker();
    };

    const formattedTime = (date?: Date) => {
        if (!date) return '';
        return date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: !is24Hour,
        });
    };

    // Helper function to render time picker
    const renderTimePicker = () => {
        if (Platform.OS === 'ios') {
            return (
                <Modal
                    isVisible={isTimePickerVisible}
                    onBackdropPress={hideTimePicker}
                    style={{ margin: 0, justifyContent: 'flex-end' }}
                >
                    <View className="bg-background w-full items-center justify-center rounded-t-xl">
                        <View className="border-border w-full flex-row items-center justify-between border-b p-4">
                            <Button variant="ghost" onPress={hideTimePicker}>
                                <Text className="text-lg font-normal">Cancel</Text>
                            </Button>
                            <Text className="text-xl font-medium">{label || 'Select Time'}</Text>
                            <Button variant="ghost" onPress={handleConfirm}>
                                <Text className="text-lg font-semibold">Done</Text>
                            </Button>
                        </View>
                        <DateTimePicker
                            value={tempDate}
                            mode="time"
                            is24Hour={is24Hour}
                            display="spinner"
                            onChange={handleTimeChange}
                            themeVariant={colors.isDark ? 'dark' : 'light'}
                            style={{ backgroundColor: colors['--color-background'] }}
                        />
                    </View>
                </Modal>
            );
        } else {
            return (
                isTimePickerVisible && (
                    <DateTimePicker
                        value={value || new Date()}
                        mode="time"
                        is24Hour={is24Hour}
                        display="default"
                        onChange={handleTimeChange}
                    />
                )
            );
        }
    };

    // Classic variant
    if (variant === 'classic') {
        return (
            <View className={cn('mb-4', containerClassName)}>
                {label && <Text className="mb-1 font-medium">{label}</Text>}
                <View className="relative">
                    <TouchableOpacity
                        onPress={showTimePicker}
                        disabled={disabled}
                        className={cn(
                            'text-foreground h-14 rounded-lg border bg-transparent px-3 py-4 pr-10',
                            isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60',
                            error ? 'border-red-500' : '',
                            disabled ? 'opacity-50' : '',
                        )}
                    >
                        <Text className={value ? 'text-lg' : 'text-lg text-gray-500'}>
                            {value ? formattedTime(value) : placeholder}
                        </Text>
                    </TouchableOpacity>
                    <Pressable className="absolute top-[18px] right-3 z-10">
                        <Icon name="Clock" size={20} color={colors['--color-foreground']} />
                    </Pressable>
                </View>
                {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
                {renderTimePicker()}
            </View>
        );
    }

    // Underlined variant
    if (variant === 'underlined') {
        return (
            <View className={cn('mb-4', containerClassName)}>
                <View className="relative">
                    <Pressable className="bg-background z-40 px-0" onPress={showTimePicker}>
                        <Animated.Text
                            style={[underlinedLabelStyle]}
                            className="bg-background text-foreground absolute z-50"
                        >
                            {label}
                        </Animated.Text>
                    </Pressable>
                    <TouchableOpacity
                        onPress={showTimePicker}
                        disabled={disabled}
                        className={cn(
                            'text-foreground h-14 border-t-0 border-r-0 border-b-2 border-l-0 bg-transparent px-0 py-4 pr-10',
                            isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60',
                            error ? 'border-red-500' : '',
                            disabled ? 'opacity-50' : '',
                        )}
                    >
                        <Text className={value ? 'text-lg' : 'text-lg text-gray-500'}>
                            {value ? formattedTime(value) : ''}
                        </Text>
                    </TouchableOpacity>
                    <Pressable className="absolute top-[18px] right-0 z-10">
                        <Icon name="Clock" size={20} color={colors['--color-foreground']} />
                    </Pressable>
                </View>
                {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
                {renderTimePicker()}
            </View>
        );
    }

    // Default animated variant
    return (
        <View className={`mb-4 ${containerClassName}`}>
            <View className="relative">
                <Pressable className="bg-background z-40 px-1" onPress={showTimePicker}>
                    <Animated.Text style={[labelStyle]} className="bg-background text-foreground absolute z-50 px-1">
                        {label}
                    </Animated.Text>
                </Pressable>
                <TouchableOpacity
                    onPress={showTimePicker}
                    disabled={disabled}
                    className={cn(
                        'text-foreground h-14 rounded-lg border bg-transparent px-3 py-4 pr-10',
                        isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60',
                        error ? 'border-red-500' : '',
                        disabled ? 'opacity-50' : '',
                    )}
                >
                    <Text className={value ? 'text-lg' : 'text-lg text-gray-500'}>
                        {value ? formattedTime(value) : ''}
                    </Text>
                </TouchableOpacity>
                <Pressable className="absolute top-[18px] right-3 z-10">
                    <Icon name="Clock" size={20} color={colors['--color-foreground']} />
                </Pressable>
            </View>
            {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
            {renderTimePicker()}
        </View>
    );
};
