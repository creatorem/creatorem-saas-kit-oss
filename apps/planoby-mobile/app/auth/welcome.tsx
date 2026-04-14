import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon } from '@kit/native-ui/icon';
import { Image, Pressable } from 'react-native';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import { Href, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import ThemeToggle from '~/components/theme-toggle';
import { authConfig } from '~/config/auth.config';

const { width } = Dimensions.get('window');
const windowWidth = Dimensions.get('window').width;

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface SlideData {
    id: string;
    title: string;
    image: { uri: string };
    banner: { uri: string };
    description: string;
    iconName: FeatherIconName;
    boxColor: string;
}

const slides: SlideData[] = [
    {
        id: '1',
        title: 'Capture Moments',
        image: { uri: 'https://picsum.photos/id/1043/300/300' },
        banner: { uri: 'https://picsum.photos/id/64/400/400' },
        description: 'Discover stunning photography from around the world',
        iconName: 'camera',
        boxColor: 'bg-violet-500',
    },
    {
        id: '2',
        title: 'Creative Collection',
        image: { uri: 'https://picsum.photos/id/1036/300/300' },
        banner: { uri: 'https://picsum.photos/id/180/400/400' },
        description: 'Curate and organize your favorite visual stories',
        iconName: 'image',
        boxColor: 'bg-teal-500',
    },
    {
        id: '3',
        title: 'Share & Inspire',
        image: { uri: 'https://picsum.photos/id/1015/300/300' },
        banner: { uri: 'https://picsum.photos/id/201/400/400' },
        description: 'Connect with a community of visual artists worldwide',
        iconName: 'share-2',
        boxColor: 'bg-pink-600',
    },
];

export default function WelcomeScreen() {
    const colors = useThemeColors();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const translateXAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        translateXAnim.setValue(30);
        scaleAnim.setValue(0.9);

        Animated.parallel([
            Animated.timing(translateXAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, [currentIndex, scaleAnim, translateXAnim]);

    const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        scrollX.setValue(offsetX);
        const index = Math.round(offsetX / width);
        setCurrentIndex(index);
    };

    return (
        <View className="bg-background relative flex-1">
            <View className="w-full flex-row justify-end px-4">
                <ThemeToggle />
            </View>

            <Animated.FlatList
                ref={flatListRef}
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: false,
                    listener: handleScroll,
                })}
                snapToAlignment="start"
                decelerationRate="fast"
                snapToInterval={windowWidth}
                renderItem={({ item, index }) => {
                    const inputRange = [(index - 1) * windowWidth, index * windowWidth, (index + 1) * windowWidth];

                    const bannerTranslateX = scrollX.interpolate({
                        inputRange,
                        outputRange: [-windowWidth * 0.2, 0, windowWidth * 0.2],
                        extrapolate: 'clamp',
                    });

                    const imageTranslateX = scrollX.interpolate({
                        inputRange,
                        outputRange: [-windowWidth * 0.1, 0, windowWidth * 0.1],
                        extrapolate: 'clamp',
                    });

                    const boxTranslateX = scrollX.interpolate({
                        inputRange,
                        outputRange: [windowWidth * 0.15, 0, -windowWidth * 0.15],
                        extrapolate: 'clamp',
                    });

                    const isCurrentSlide = index === currentIndex;

                    return (
                        <View style={{ width: windowWidth }}>
                            <View className="flex-1 items-center justify-center p-6">
                                <View className="relative w-full items-center justify-center p-6">
                                    <Animated.View
                                        style={{
                                            position: 'absolute',
                                            top: -20,
                                            left: 70,
                                            transform: [
                                                { translateX: bannerTranslateX },
                                                {
                                                    translateX: isCurrentSlide
                                                        ? translateXAnim.interpolate({
                                                            inputRange: [0, 20],
                                                            outputRange: [-20, 0],
                                                        })
                                                        : 0,
                                                },
                                            ],
                                        }}
                                    >
                                        <Image
                                            source={item.banner}
                                            className="h-24 w-24 rounded-[20px]"
                                        // style={{ borderRadius: 20 }}
                                        />
                                    </Animated.View>

                                    <Animated.View
                                        style={{
                                            zIndex: 20,
                                            transform: [
                                                { translateX: imageTranslateX },
                                                //{ scale: isCurrentSlide ? scaleAnim : 1 }
                                            ],
                                        }}
                                    >
                                        <Image
                                            source={item.image}
                                            className="border-border h-44 w-44 rounded-[40px] border-8"
                                        // style={{ borderRadius: 40 }}
                                        />
                                    </Animated.View>

                                    <Animated.View
                                        style={{
                                            position: 'absolute',
                                            bottom: -2,
                                            right: 56,
                                            zIndex: 30,
                                            transform: [
                                                { translateX: boxTranslateX },
                                                {
                                                    translateX: isCurrentSlide
                                                        ? translateXAnim.interpolate({
                                                            inputRange: [0, 50],
                                                            outputRange: [0, 0],
                                                        })
                                                        : 0,
                                                },
                                            ],
                                        }}
                                    >
                                        <View
                                            className={cn(
                                                'border-border h-20 w-20 items-center justify-center rounded-3xl border-8',
                                                item.boxColor,
                                            )}
                                        >
                                            <Feather name={item.iconName} size={24} color="white" />
                                        </View>
                                    </Animated.View>
                                </View>

                                <Animated.View className="flex items-center justify-center">
                                    <Text className="mt-4 text-center text-3xl font-bold">{item.title}</Text>
                                    <Text className="text-muted-foreground mt-2 text-center">{item.description}</Text>
                                </Animated.View>
                            </View>
                        </View>
                    );
                }}
                ListFooterComponent={() => <View className="h-28 w-full" />}
                keyExtractor={(item) => item.id}
            />

            <View className="mb-20 w-full flex-row justify-center">
                {slides.map((_, index) => (
                    <View
                        key={index}
                        className={cn(
                            'mx-1 h-2 rounded-full',
                            index === currentIndex ? 'bg-primary w-2' : 'bg-secondary w-2',
                        )}
                    />
                ))}
            </View>

            {/* Login/Signup Buttons */}
            <View className="mb-12 flex w-full flex-col space-y-2 px-6">
                <View className="flex flex-row items-center justify-center gap-2">
                    <Pressable
                        onPress={() => router.push(authConfig.urls.signIn as Href)}
                        className="flex w-1/4 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-black py-4 dark:bg-white"
                    >
                        <Icon name="LogInIcon" color={colors['--color-background']} size={20} />
                        <Text className="text-background">Sign in</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => router.push(authConfig.urls.signUp as Href)}
                        className="flex flex-1 flex-row items-center justify-center gap-2 rounded-full border border-black py-4 dark:border-white"
                    >
                        <Icon name="UserPlus" size={20} />
                        <Text>Register</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
