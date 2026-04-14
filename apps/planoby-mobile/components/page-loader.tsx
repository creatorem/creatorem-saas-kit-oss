import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Text } from '@kit/native-ui/text';
import { ActivityIndicator, View } from 'react-native';

interface PageLoaderProps {
    text?: string;
}

export default function PageLoader({ text }: PageLoaderProps) {
    const colors = useThemeColors();

    return (
        <View className="bg-background flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors['--color-primary']} />
            {text && <Text className="text-muted-foreground mt-4">{text}</Text>}
        </View>
    );
}
