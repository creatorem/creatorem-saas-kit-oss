import { ActionSheet, ActionSheetContent, ActionSheetTrigger } from '@kit/native-ui/action-sheet';
import { Button } from '@kit/native-ui/button';
import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon } from '@kit/native-ui/icon';
import { Text } from '@kit/native-ui/text';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

interface FavoriteProps {
    initialState?: boolean;
    size?: number;
    className?: string;
    productName?: string;
    isWhite?: boolean;
    onToggle?: (isFavorite: boolean) => void;
}

const Favorite: React.FC<FavoriteProps> = ({
    initialState = false,
    size = 24,
    className = '',
    productName = 'Product',
    onToggle,
    isWhite = false,
}) => {
    const [isFavorite, setIsFavorite] = useState(initialState);
    const [open, setOpen] = useState<boolean>(false);
    const colors = useThemeColors();

    const handleToggle = () => {
        const newState = !isFavorite;
        setIsFavorite(newState);

        if (onToggle) {
            onToggle(newState);
        }
    };

    const handleViewFavorites = () => {
        setOpen(false);
        // Navigate to favorites screen
        router.push('/(app)/(tabs)/favorites');
    };

    return (
        <ActionSheet open={open} onOpenChange={setOpen}>
            <ActionSheetTrigger onPress={handleToggle} className={className}>
                <Button variant="ghost">
                    {isWhite ? (
                        <Icon
                            name="Bookmark"
                            size={size}
                            fill={isFavorite ? 'white' : 'none'}
                            color={isFavorite ? 'white' : 'white'}
                            strokeWidth={1.8}
                        />
                    ) : (
                        <Icon
                            name="Bookmark"
                            size={size}
                            fill={isFavorite ? colors['--color-primary'] : 'none'}
                            color={isFavorite ? colors['--color-primary'] : colors['--color-opposite']}
                            strokeWidth={1.8}
                        />
                    )}
                </Button>
            </ActionSheetTrigger>

            <ActionSheetContent>
                <View className="p-4 pb-6">
                    <Text className="mt-4 mb-1 text-left text-xl font-bold">
                        {isFavorite ? 'Added to Bookmarks' : 'Removed from Bookmarks'}
                    </Text>

                    <Text className="mb-6 text-left">
                        {isFavorite
                            ? `${productName} has been added to your bookmarks.`
                            : `${productName} has been removed from your bookmarks.`}
                    </Text>

                    <View className="w-full flex-row justify-center">
                        {isFavorite && (
                            <Button className="flex-1" onPress={handleViewFavorites}>
                                <Text>View Bookmarks</Text>
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            className={isFavorite ? 'ml-3 px-6' : 'px-6'}
                            onPress={() => setOpen(false)}
                        >
                            <Text>Continue Browsing</Text>
                        </Button>
                    </View>
                </View>
            </ActionSheetContent>
        </ActionSheet>
    );
};

export default Favorite;
