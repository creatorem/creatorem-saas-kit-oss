import { Button } from '@kit/native-ui/button';
import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon } from '@kit/native-ui/icon';
import { InputVariant } from '@kit/native-ui/input';
import { Pressable, TouchableOpacity } from '@kit/native-ui/react-native';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, View } from 'react-native';
import Modal from 'react-native-modal';
import { formatToYYYYMMDD } from '~/utils/date';

interface DatePickerProps {
    value?: Date;
    onChange: (date: Date) => void;
    label?: string;
    placeholder?: string;
    maxDate?: Date;
    minDate?: Date;
    error?: string;
    containerClassName?: string;
    variant?: InputVariant;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    label,
    placeholder = 'Select date',
    maxDate,
    minDate,
    error,
    containerClassName = '',
    variant = 'animated',
}) => {
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
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

    const showDatePicker = () => {
        setIsFocused(true);
        setDatePickerVisible(true);
    };

    const hideDatePicker = () => {
        setIsFocused(false);
        setDatePickerVisible(false);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            hideDatePicker();
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
        hideDatePicker();
    };

    // Helper function to render date picker modal/component
    const renderDatePicker = () => {
        if (Platform.OS === 'ios') {
            return (
                <Modal
                    isVisible={isDatePickerVisible}
                    onBackdropPress={hideDatePicker}
                    style={{ margin: 0, justifyContent: 'flex-end' }}
                >
                    <View className="bg-background w-full items-center justify-center rounded-t-xl">
                        <View className="border-border w-full flex-row items-center justify-between border-b p-4">
                            <Button variant="ghost" onPress={hideDatePicker}>
                                <Text className="text-lg font-normal">Cancel</Text>
                            </Button>
                            <Text className="text-xl font-medium">{label || 'Select Date'}</Text>
                            <Button variant="ghost" onPress={handleConfirm}>
                                <Text className="text-lg font-semibold">Done</Text>
                            </Button>
                        </View>
                        <DateTimePicker
                            value={tempDate}
                            mode="date"
                            display="spinner"
                            onChange={handleDateChange}
                            maximumDate={maxDate}
                            minimumDate={minDate}
                            themeVariant={colors.isDark ? 'dark' : 'light'}
                            style={{ backgroundColor: colors['--color-background'] }}
                        />
                    </View>
                </Modal>
            );
        } else {
            return (
                isDatePickerVisible && (
                    <DateTimePicker
                        value={value || new Date()}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        maximumDate={maxDate}
                        minimumDate={minDate}
                    />
                )
            );
        }
    };

    // Classic non-animated variant
    if (variant === 'classic') {
        return (
            <View className={cn('mb-4', containerClassName)}>
                {label && <Text className="mb-1 font-medium">{label}</Text>}
                <View className="relative">
                    <TouchableOpacity
                        onPress={showDatePicker}
                        className={cn(
                            'text-foreground h-14 rounded-lg border bg-transparent px-3 py-4 pr-10',
                            isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60',
                            error ? 'border-red-500' : '',
                        )}
                    >
                        <Text className={value ? 'text-lg' : 'text-lg text-gray-500'}>
                            {value ? formatToYYYYMMDD(value) : placeholder}
                        </Text>
                    </TouchableOpacity>
                    <Pressable className="absolute top-[18px] right-3 z-10">
                        <Icon name="Calendar" size={20} color={colors['--color-foreground']} />
                    </Pressable>
                </View>
                {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
                {renderDatePicker()}
            </View>
        );
    }

    // Underlined variant
    if (variant === 'underlined') {
        return (
            <View className={cn('mb-4', containerClassName)}>
                <View className="relative">
                    <Pressable className="bg-background z-40 px-0" onPress={showDatePicker}>
                        <Animated.Text
                            style={[underlinedLabelStyle]}
                            className="bg-background text-foreground absolute z-50"
                        >
                            {label}
                        </Animated.Text>
                    </Pressable>
                    <TouchableOpacity
                        onPress={showDatePicker}
                        className={cn(
                            'text-foreground h-14 border-t-0 border-r-0 border-b-2 border-l-0 bg-transparent px-0 py-4 pr-10',
                            isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60',
                            error ? 'border-red-500' : '',
                        )}
                    >
                        <Text className={value ? 'text-lg' : 'text-lg text-gray-500'}>
                            {value ? formatToYYYYMMDD(value) : ''}
                        </Text>
                    </TouchableOpacity>
                    <Pressable className="absolute top-[18px] right-0 z-10">
                        <Icon name="Calendar" size={20} color={colors['--color-foreground']} />
                    </Pressable>
                </View>
                {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
                {renderDatePicker()}
            </View>
        );
    }

    // Default animated variant
    return (
        <View className={`mb-4 ${containerClassName}`}>
            <View className="relative">
                <Pressable className="bg-background z-40 px-1" onPress={showDatePicker}>
                    <Animated.Text style={[labelStyle]} className="bg-background text-foreground absolute z-50 px-1">
                        {label}
                    </Animated.Text>
                </Pressable>
                <TouchableOpacity
                    onPress={showDatePicker}
                    className={cn(
                        'text-foreground h-14 rounded-lg border bg-transparent px-3 py-4 pr-10',
                        isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60',
                        error ? 'border-red-500' : '',
                    )}
                >
                    <Text className={value ? 'text-lg' : 'text-lg text-gray-500'}>
                        {value ? formatToYYYYMMDD(value) : ''}
                    </Text>
                </TouchableOpacity>
                <Pressable className="absolute top-[18px] right-3 z-10">
                    <Icon name="Calendar" size={20} color={colors['--color-foreground']} />
                </Pressable>
            </View>
            {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
            {renderDatePicker()}
        </View>
    );
};
