import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import React, { ReactNode, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, TouchableOpacity, View, ViewStyle } from 'react-native';
import AnimatedView from './animated-view';

type ThemeTabsProps = {
    children: ReactNode;
    headerComponent?: ReactNode;
    footerComponent?: ReactNode;
    type?: 'scrollview' | 'fixed';
    className?: string;
    style?: ViewStyle;
    scrollEnabled?: boolean;
};

type ThemeTabProps = {
    name: string;
    children: ReactNode;
    type?: 'scrollview' | 'flatlist' | 'view';
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ThemeTab: React.FC<ThemeTabProps> = ({ children }) => {
    return (
        <View className="" style={{ width: SCREEN_WIDTH, height: '100%' }}>
            {children}
        </View>
    );
};

const ThemeTabs: React.FC<ThemeTabsProps> = ({
    children,
    headerComponent,
    footerComponent,
    style,
    type = 'fixed',
    scrollEnabled = true,
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const tabContentRef = useRef<ScrollView>(null);
    const mainScrollRef = useRef<ScrollView>(null);

    // Filter out only ThemeTab components from children
    const tabs = React.Children.toArray(children).filter(
        (child) => React.isValidElement(child) && child.type === ThemeTab,
    );

    const handleTabPress = (index: number) => {
        setActiveTab(index);
        tabContentRef.current?.scrollTo({
            x: index * SCREEN_WIDTH,
            animated: true,
        });
    };

    const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: false,
    });

    const handleScrollEnd = (event: any) => {
        const position = event.nativeEvent.contentOffset.x;
        const index = Math.round(position / SCREEN_WIDTH);
        setActiveTab(index);
    };

    // Calculate sticky header indices correctly based on whether headerComponent exists
    const stickyHeaderIndices = headerComponent ? [1] : [0];

    return (
        <View className="bg-background flex-1">
            <ScrollView
                ref={mainScrollRef}
                stickyHeaderIndices={stickyHeaderIndices}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
                className="flex-1"
            >
                {/* Header Component - Will scroll up */}
                {headerComponent && <View>{headerComponent}</View>}

                {/* Tab Bar - This will be sticky */}
                <View className="z-10">
                    {type === 'scrollview' ? (
                        <ScrollView
                            showsHorizontalScrollIndicator={false}
                            horizontal
                            className="bg-background border-border h-[48px] flex-row border-b"
                        >
                            {tabs.map((tab, index) => {
                                if (!React.isValidElement(tab)) return null;
                                return (
                                    <Animated.View key={index}>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            className="relative h-full items-center justify-center px-4"
                                            onPress={() => handleTabPress(index)}
                                        >
                                            <Text className={cn('text-lg', activeTab === index ? 'text-primary' : '')}>
                                                {(tab.props as ThemeTabProps).name}
                                            </Text>
                                            {activeTab === index && (
                                                <View className="bg-primary absolute bottom-0 h-[2px] w-full" />
                                            )}
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })}
                        </ScrollView>
                    ) : (
                        <View className="bg-background border-border h-[48px] flex-row border-b">
                            {tabs.map((tab, index) => {
                                if (!React.isValidElement(tab)) return null;
                                return (
                                    <Animated.View key={index} className="flex-1">
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            className="relative flex-1 items-center justify-center px-3"
                                            onPress={() => handleTabPress(index)}
                                        >
                                            <Text className={cn('text-lg', activeTab === index ? 'text-primary' : '')}>
                                                {(tab.props as ThemeTabProps).name}
                                            </Text>
                                            {activeTab === index && (
                                                <View className="bg-primary absolute bottom-0 h-[2px] w-full" />
                                            )}
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Tab Content - Horizontal scrollable area */}
                <View className="flex-1">
                    {scrollEnabled ? (
                        <ScrollView
                            ref={tabContentRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            onMomentumScrollEnd={handleScrollEnd}
                            className="flex-1"
                            scrollEnabled={scrollEnabled}
                        >
                            {tabs}
                        </ScrollView>
                    ) : (
                        <AnimatedView key={activeTab} duration={600} animation="fadeIn" style={{ width: SCREEN_WIDTH }}>
                            {tabs[activeTab]}
                        </AnimatedView>
                    )}
                </View>

                {footerComponent && <View>{footerComponent}</View>}
            </ScrollView>
        </View>
    );
};

export default ThemeTabs;
