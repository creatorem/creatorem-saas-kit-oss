import { I18nProvider } from '@kit/i18n/shared/provider';
import { Toaster } from '@kit/native-ui/sonner';
import { ThemeProvider } from '@kit/native-ui/theme-provider';
import { cn } from '@kit/utils';
import { getLocales } from 'expo-localization';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { i18nConfig } from '~/config/i18n.config';
import { darkTheme, lightTheme } from '../../config/themes';
import { NotificationProvider } from './notification-provider';
import { ReactQueryProvider } from './react-query-provider';

const locale = getLocales()[0];
if (!locale) {
    throw new Error('No locale found');
}
const lang = locale.languageCode;

export function RootProvider({ children }: { children: React.ReactNode }) {
    return (
        <NotificationProvider>
            <GestureHandlerRootView className={cn('bg-background flex-1', Platform.OS === 'ios' ? 'pb-0' : '')}>
                <ThemeProvider light={lightTheme} dark={darkTheme}>
                    <ReactQueryProvider>
                        <I18nProvider config={i18nConfig} lang={lang ?? undefined}>
                            {children}

                            <Toaster />
                            <StatusBar style="auto" />
                        </I18nProvider>
                    </ReactQueryProvider>
                </ThemeProvider>
            </GestureHandlerRootView>
        </NotificationProvider>
    );
}
