import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon, IconName } from '@kit/native-ui/icon';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Pressable,
    TextInput as RNTextInput,
    TextInput as RNTextInputType,
    TextInputProps,
    View,
} from 'react-native';

interface CustomTextInputProps extends TextInputProps {
    label: string;
    rightIcon?: IconName;
    onRightIconPress?: () => void;
    error?: string;
    isPassword?: boolean;
    className?: string;
    containerClassName?: string;
}

const TextInput: React.FC<CustomTextInputProps> = ({
    label,
    rightIcon,
    onRightIconPress,
    error,
    isPassword = false,
    className = '',
    containerClassName = '',
    value,
    onChangeText,
    ...props
}) => {
    const colors = useThemeColors();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current;
    const inputRef = useRef<RNTextInputType>(null);

    // Handle label animation
    useEffect(() => {
        Animated.timing(animatedLabelValue, {
            toValue: isFocused || value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused, value, animatedLabelValue]);

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
        left: 12, // Consistent left padding
        paddingHorizontal: 8, // Consistent padding on both sides
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Determine the right icon based on props and password state
    const renderRightIcon = () => {
        if (isPassword) {
            return (
                <Pressable onPress={togglePasswordVisibility} className="absolute top-[18px] right-3 z-10">
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} color={colors['--color-foreground']} />
                </Pressable>
            );
        }

        if (rightIcon) {
            return (
                <Pressable onPress={onRightIconPress} className="absolute top-[18px] right-3 z-10">
                    <Icon name={rightIcon} size={20} color={colors['--color-foreground']} />
                </Pressable>
            );
        }

        return null;
    };

    return (
        <View className={cn('mb-4', containerClassName)}>
            <View className="relative">
                <Pressable className="bg-background z-40 px-1" onPress={() => inputRef.current?.focus()}>
                    <Animated.Text style={[labelStyle]} className="bg-background text-foreground absolute z-50 px-1">
                        {label}
                    </Animated.Text>
                </Pressable>

                <RNTextInput
                    ref={inputRef}
                    className={cn(
                        'text-foreground h-14 rounded-lg border bg-transparent px-3 py-3',
                        isPassword || rightIcon ? 'pr-10' : '',
                        isFocused ? 'border-black dark:border-white' : 'border-black/40 dark:border-white/40',
                        error ? 'border-red-500' : '',
                        className,
                    )}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isPassword && !showPassword}
                    placeholderTextColor="transparent"
                    {...props}
                />

                {renderRightIcon()}
            </View>

            {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
        </View>
    );
};

export default TextInput;
