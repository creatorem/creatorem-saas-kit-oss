import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon, IconName } from '@kit/native-ui/icon';
import { Pressable } from '@kit/native-ui/react-native';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import { TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, ReactNode, useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

export type TabButtonProps = Omit<TabTriggerSlotProps, 'style'> & {
    icon?: IconName;
    avatar?: React.ReactNode;
    customContent?: ReactNode;
    labelAnimated?: boolean;
    hasBadge?: boolean;
    visible?: boolean;
};

export const TabButton = forwardRef<View, TabButtonProps>(
    (
        {
            icon,
            avatar,
            children,
            isFocused,
            onPress,
            visible = true,
            customContent,
            labelAnimated = true,
            hasBadge = false,
            ...props
        },
        ref,
    ) => {
        const colors = useThemeColors();

        // Use Animated Values to control opacity and translateY
        const [labelOpacity] = useState(new Animated.Value(isFocused ? 1 : 0));
        const [labelMarginBottom] = useState(new Animated.Value(isFocused ? 0 : 10));
        const [lineScale] = useState(new Animated.Value(isFocused ? 0 : 10));

        // Animate opacity and translation when the tab becomes focused or unfocused
        useEffect(() => {
            Animated.parallel([
                Animated.timing(labelOpacity, {
                    toValue: isFocused ? 1 : 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(labelMarginBottom, {
                    toValue: isFocused ? 0 : 10,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(lineScale, {
                    toValue: isFocused ? 1 : 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }, [isFocused, labelMarginBottom, labelOpacity, lineScale]);

        // Render icon or custom content
        const renderContent = () => {
            if (customContent) {
                return customContent;
            }

            if (icon) {
                return (
                    <View className="relative">
                        <View className={cn('relative w-full', isFocused ? 'opacity-100' : 'opacity-40')}>
                            {/*isFocused && (
                <AnimatedView animation='scaleIn' duration={200} className='absolute border-4 rounded-full border-background -top-1 -left-1/3  w-full h-8  bg-primary/20' ></AnimatedView>
              )}*/}
                            <Icon
                                name={icon}
                                size={24}
                                strokeWidth={isFocused ? 2.5 : 2}
                                color={isFocused ? colors['--color-primary'] : colors['--color-opposite']}
                            />
                        </View>
                        {hasBadge && (
                            <View className="border-background absolute -top-1 -right-1.5 h-3 w-3 rounded-full border bg-red-500" />
                        )}
                    </View>
                );
            }
            if (avatar) {
                return (
                    <View
                        className={cn(
                            'bg-muted rounded-full border-2',
                            isFocused ? 'border-primary' : 'border-transparent',
                        )}
                    >
                        {avatar}
                    </View>
                );
            }
            return null;
        };

        return (
            <Pressable
                ref={ref}
                style={{
                    flex: 1,
                    display: visible ? 'flex' : 'none',
                }}
                // {...props}
                onPress={onPress}
            >
                <View className={cn('overflow-hidden', isFocused ? '' : '')}>
                    <View
                        className={cn(
                            'relative w-full flex-col items-center justify-center pb-0',
                            avatar ? 'pt-3' : 'pt-4',
                        )}
                    >
                        {/*<Animated.View className="absolute w-full h-[2px] bg-black dark:bg-white left-0 top-0"
            style={{
              opacity: lineScale,
              transform: [{ scaleX: lineScale }],
            }}
          />*/}

                        {renderContent()}

                        {labelAnimated ? (
                            <Animated.View
                                className="relative"
                                style={{
                                    opacity: labelOpacity,
                                    transform: [{ translateY: labelMarginBottom }],
                                }}
                            >
                                <Text className={`text-primary mt-px text-[9px]`}>{children}</Text>
                            </Animated.View>
                        ) : (
                            <Text className={`mt-px text-[9px]`}>{children}</Text>
                        )}
                    </View>
                </View>
            </Pressable>
        );
    },
);

TabButton.displayName = 'TabButton';
