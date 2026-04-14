import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import React from 'react';
import { View } from 'react-native';

interface ShowRatingProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    displayMode?: 'number' | 'stars';
    className?: string;
    color?: string;
}

const ShowRating: React.FC<ShowRatingProps> = ({
    rating,
    maxRating = 5,
    size = 'md',
    displayMode = 'number',
    className = '',
    color,
}) => {
    const colors = useThemeColors();

    const starColor = color || colors['--color-foreground'];

    const getSize = () => {
        switch (size) {
            case 'sm':
                return { icon: 12, text: 'text-sm' };
            case 'md':
                return { icon: 16, text: 'text-base' };
            case 'lg':
                return { icon: 20, text: 'text-lg' };
            default:
                return { icon: 16, text: 'text-base' };
        }
    };

    if (displayMode === 'number') {
        return (
            <View className={cn('flex-row items-center gap-x-1', className)}>
                <Ionicons name="star" size={getSize().icon} color={starColor} />
                <Text className={cn('font-medium', getSize().text)} style={color ? { color: starColor } : undefined}>
                    {rating.toFixed(1)}
                </Text>
            </View>
        );
    }

    return (
        <View className={cn('flex-row gap-0.5', className)}>
            {[...Array(maxRating)].map((_, index) => (
                <Ionicons
                    key={index}
                    name={index < Math.round(rating) ? 'star' : 'star-outline'}
                    size={getSize().icon}
                    color={starColor}
                />
            ))}
        </View>
    );
};

export default ShowRating;
