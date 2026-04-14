import { useIsFocused } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import type { AnimationType } from './animated-view';
import AnimatedView from './animated-view';

interface TabScreenWrapperProps {
    children: React.ReactNode;
    animation?: AnimationType;
    duration?: number;
    delay?: number;
}

export default function TabScreenWrapper({
    children,
    animation = 'fadeIn',
    duration = 300,
    delay = 0,
}: TabScreenWrapperProps) {
    const isFocused = useIsFocused();
    const [key, setKey] = React.useState(0);

    React.useEffect(() => {
        if (isFocused) {
            setKey((prev) => prev + 1);
        }
    }, [isFocused]);

    return (
        <View className="bg-background flex-1">
            <AnimatedView style={{ flex: 1 }} key={key} animation={animation} duration={duration} delay={delay}>
                {children}
            </AnimatedView>
        </View>
    );
}
