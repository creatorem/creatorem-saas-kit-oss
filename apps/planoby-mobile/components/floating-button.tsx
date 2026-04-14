import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon, IconName } from '@kit/native-ui/icon';
import { Text } from '@kit/native-ui/text';
import { Href, Link } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface FloatingButtonProps {
    icon: IconName;
    label?: string;
    onPress?: () => void;
    href?: Href;
    className?: string;
    bottom?: number;
    right?: number;
    visible?: boolean;
    isAnimated?: boolean;
    style?: ViewStyle;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
    icon,
    label,
    onPress,
    href,
    className = '',
    bottom = 20,
    right = 20,
    visible = true,
    isAnimated = false,
    style,
}) => {
    const colors = useThemeColors();
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!isAnimated) return;

        Animated.parallel([
            Animated.spring(translateY, {
                toValue: visible ? 0 : 100,
                useNativeDriver: true,
                tension: 40,
                friction: 8,
            }),
            Animated.timing(opacity, {
                toValue: visible ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [visible, isAnimated, translateY, opacity]);

    const containerStyle = isAnimated
        ? {
              transform: [{ translateY }],
              opacity,
          }
        : {
              opacity: visible ? 1 : 0,
          };

    const buttonContent = (
        <TouchableOpacity
            onPress={onPress}
            className="bg-primary flex-row items-center rounded-full px-4 py-3 shadow-lg"
            style={[styles.button, style]}
        >
            <Icon name={icon} size={20} color="white" />
            <Text className="ml-2 text-white">{label}</Text>
        </TouchableOpacity>
    );

    return (
        <Animated.View
            className={className}
            style={[
                styles.container,
                containerStyle,
                {
                    bottom,
                    right,
                } as ViewStyle,
            ]}
        >
            {href ? (
                <Link href={href} asChild>
                    {buttonContent}
                </Link>
            ) : (
                buttonContent
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 1000,
    },
    button: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default FloatingButton;
