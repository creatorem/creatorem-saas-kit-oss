import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { useTheme } from '@kit/native-ui/theme-provider';
import * as NavigationBar from 'expo-navigation-bar';
import type { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * A hook that handles theme-dependent styling for navigation and status bars
 * Returns configuration objects and components for themed navigation
 */
export function useScreenStatus() {
    const { isDark } = useTheme();
    const colors = useThemeColors();

    // Set up status/navigation bar styling based on theme
    useEffect(() => {
        if (Platform.OS === 'android') {
            // Set navigation bar color
            NavigationBar.setBackgroundColorAsync(colors['--color-background']);
            NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
        }
    }, [isDark, colors['--color-background']]);

    // StatusBar component with appropriate theme styling
    const ThemedStatusBar = () => (
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor="transparent" translucent={true} />
    );

    // Navigation container/stack screen options for themed backgrounds
    const screenOptions: React.ComponentPropsWithRef<typeof Stack>['screenOptions'] = {
        headerShown: false,
        // headerShown: true,
        // @ts-expect-error
        backgroundColor: colors['--color-background'],
        contentStyle: {
            backgroundColor: colors['--color-background'],
        },
        // statusBarStyle: 'auto',
        // animation: 'slide_from_right',
        // animationDuration: 300,
    };

    return {
        ThemedStatusBar,
        screenOptions,
        colors,
        isDark,
    };
}
