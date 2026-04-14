import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { ActivityIndicator, View } from 'react-native';

export function LoadingScreen() {
    const colors = useThemeColors();

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors['--color-background'],
            }}
        >
            <ActivityIndicator />
        </View>
    );
}
