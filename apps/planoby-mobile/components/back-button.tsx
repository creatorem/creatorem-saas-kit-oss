import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon } from '@kit/native-ui/icon';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { TouchableOpacity } from 'react-native';

export const BackButton = () => {
    const colors = useThemeColors();

    const handleBackPress = useCallback(() => {
        router.back();
    }, [router]);

    return (
        <TouchableOpacity onPress={handleBackPress} className="relative z-50 mr-auto py-4">
            <Icon
                name="ArrowLeft"
                size={24}
                // color={isTransparent ? 'white' : colors['--color-opposite']}
                color={colors['--color-foreground']}
            />
        </TouchableOpacity>
    );
};
