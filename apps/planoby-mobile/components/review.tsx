import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon } from '@kit/native-ui/icon';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Avatar } from './avatar';

interface ReviewProps {
    rating: number;
    description: string;
    date: string;
    username?: string;
    avatar?: string;
    className?: string;
    style?: ViewStyle;
}

const Review: React.FC<ReviewProps> = ({ rating, description, date, username, avatar, className = '', style }) => {
    const colors = useThemeColors();

    const renderStars = () => {
        const stars = [];

        for (let i = 0; i < 5; i++) {
            stars.push(
                <Icon
                    key={i}
                    name="Star"
                    size={16}
                    fill={i < rating ? colors['--color-foreground'] : 'none'}
                    color={i < rating ? colors['--color-foreground'] : colors['--color-foreground']}
                    strokeWidth={1.5}
                    className="mr-1"
                />,
            );
        }

        return (
            <View className="flex-row items-center">
                {stars}
                <Text className="ml-1 text-base">{rating}.0</Text>
            </View>
        );
    };

    return (
        <View className={cn('', className)}>
            <View className="flex-row">
                {(avatar || username) && <Avatar src={avatar} name={username} size="xs" className="mr-3" />}
                <View className="flex-1">
                    {username && <Text className="mb-1 font-bold">{username}</Text>}
                    <View className="mb-2 flex-row items-center justify-between">
                        {renderStars()}
                        <Text className="text-muted-foreground text-base">{date}</Text>
                    </View>
                    <Text className="text-base">{description}</Text>
                </View>
            </View>
        </View>
    );
};

export default Review;
