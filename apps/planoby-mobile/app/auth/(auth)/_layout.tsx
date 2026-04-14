import { LanguageSelectorBase } from '@kit/i18n/native/ui/language-selector';
import { BackButton } from '@kit/native-ui/back-button';
import { Slot } from 'expo-router';
import { View } from 'react-native';
import { Logo } from '~/components/logo';
import ThemeToggle from '~/components/theme-toggle';
import { useScreenStatus } from '~/hooks/use-screen-status';

export default function AuthLayout() {
    const { screenOptions } = useScreenStatus();
    return (
        <View className="bg-background flex-1 p-6">
            <View className="flex flex-row justify-between">
                <BackButton />
                <LanguageSelectorBase />
            </View>

            <View className="mt-0">
                <Logo className="mb-14" />
                <Slot screenOptions={screenOptions} />
            </View>

            <View className="flex-1" />

            <ThemeToggle className="ml-auto" />
        </View>
    );
}
