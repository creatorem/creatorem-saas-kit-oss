import { LanguageSelectorBase } from '@kit/i18n/native/ui/language-selector';
import { Button } from '@kit/native-ui/button';
import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon } from '@kit/native-ui/icon';
import { Header } from '@kit/native-ui/layout/header';
import { Section } from '@kit/native-ui/layout/section';
import { Text } from '@kit/native-ui/text';
import { ThemedScroller } from '@kit/native-ui/themed-scroller';
import { SettingsNavigation } from '@kit/settings/native/ui';
import { useSignOut } from '@kit/supabase';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import AnimatedView from '~/components/animated-view';
import ThemeToggle from '~/components/theme-toggle';
import { useSettingsUiConfig } from '~/hooks/use-settings-ui-config';
import { version } from '../../../package.json';

export default function SettingsMenu() {
    const { t } = useTranslation('common');
    const signOut = useSignOut();
    const colors = useThemeColors();

    const handleSignOut = useCallback(async () => {
        await signOut.mutateAsync();
        router.push('/');
    }, [router]);

    const settingsUiConfig = useSettingsUiConfig();

    return (
        <View className="bg-background flex-1">
            <AnimatedView animation="fadeIn" duration={350} playOnlyOnce={false}>
                <Header
                    showBackButton
                    onBackPress={() => {
                        router.replace('/(tabs)/profile');
                    }}
                />
                <ThemedScroller className="px-0">
                    <Section
                        titleSize="3xl"
                        className="px-6 pt-4 pb-10"
                        title={t('settings.title')}
                        subtitle={t('settings.subtitle')}
                    />

                    <View className="flex-1 px-6">
                        <SettingsNavigation uiConfig={settingsUiConfig.ui} basePath={'/screens/settings'} />

                        <LanguageSelectorBase className="mt-8" />

                        <Button variant={'destructive_ghost'} onPress={handleSignOut} className="mt-8 rounded-full">
                            <Icon name="LogOut" size={16} color={colors['--color-destructive']} />
                            <Text>{t('settings.logout')}</Text>
                            <Icon name="ChevronRight" size={16} color={colors['--color-destructive']} />
                        </Button>

                        <View className="mt-8 flex-row items-center justify-between">
                            <Text className="text-muted-foreground text-sm">{t('settings.version', { version })}</Text>
                            <ThemeToggle />
                        </View>
                    </View>
                </ThemedScroller>
            </AnimatedView>
        </View>
    );
}
