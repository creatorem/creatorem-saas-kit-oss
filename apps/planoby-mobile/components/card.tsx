import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Button } from '@kit/native-ui/button';
import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { TouchableOpacity } from '@kit/native-ui/react-native';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import { Dimensions, Image, ImageBackground, ImageSourcePropType, View, ViewStyle } from 'react-native';
import Favorite from './favorite';

const { width: windowWidth } = Dimensions.get('window');
interface CardProps {
    title: string;
    description?: string;
    hasShadow?: boolean;
    image: string | ImageSourcePropType;
    href?: Href;
    onPress?: () => void;
    variant?: 'classic' | 'overlay' | 'compact' | 'minimal';
    className?: string;
    button?: string;
    onButtonPress?: () => void;
    price?: string;
    rating?: number;
    badge?: string;
    badgeColor?: string;
    icon?: string;
    iconColor?: string;
    imageHeight?: number;
    showOverlay?: boolean;
    hasFavorite?: boolean;
    overlayGradient?: readonly [string, string];
    width?: any;
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    children?: React.ReactNode;
    style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
    title,
    description,
    image,
    hasShadow = false,
    href,
    onPress,
    variant = 'classic',
    className = 'w-full',
    button,
    onButtonPress,
    price,
    rating,
    badge,
    hasFavorite = false,
    badgeColor = '#000000',
    imageHeight = 200,
    showOverlay = true,
    overlayGradient = ['transparent', 'rgba(0,0,0,0.3)'] as readonly [string, string],
    rounded = 'lg',
    width = '100%',
    children,
    ...props
}) => {
    const handlePress = () => {
        if (onPress) {
            onPress();
        }
    };

    const getRoundedClass = () => {
        switch (rounded) {
            case 'none':
                return 'rounded-none';
            case 'sm':
                return 'rounded-sm';
            case 'md':
                return 'rounded-md';
            case 'lg':
                return 'rounded-lg';
            case 'xl':
                return 'rounded-xl';
            case '2xl':
                return 'rounded-2xl';
            case 'full':
                return 'rounded-full';
            default:
                return 'rounded-lg';
        }
    };

    const renderBadge = () => {
        if (!badge) return null;
        return (
            <View
                className={cn('absolute top-2 right-2 z-10 rounded-full px-2 py-1', getRoundedClass())}
                style={{ backgroundColor: badgeColor }}
            >
                <Text className="text-sm font-medium text-white">{badge}</Text>
            </View>
        );
    };
    const colors = useThemeColors();
    const renderRating = () => {
        if (!rating) return null;
        return (
            <View className="flex-row items-center">
                <MaterialIcons name="star" size={16} color={colors['--color-foreground']} />
                <Text className="ml-0 text-sm font-semibold">{rating}</Text>
            </View>
        );
    };

    const renderPrice = () => {
        if (!price) return null;
        return (
            <Text
                className={cn(
                    'text-base font-bold',
                    variant === 'overlay' ? 'text-white' : 'text-dark-primary dark:text-white',
                )}
            >
                {price}
            </Text>
        );
    };

    const renderContent = () => {
        const cardContent = (
            <View className={cn('bg-secondary flex-1 shadow-md', getRoundedClass(), className)}>
                <View className="relative">
                    {hasFavorite && (
                        <View className="absolute top-2 right-2 z-50">
                            <Favorite initialState={false} productName={title} size={24} />
                        </View>
                    )}
                    {variant === 'overlay' ? (
                        <ImageBackground
                            source={typeof image === 'string' ? { uri: image } : image}
                            className={cn('w-full overflow-hidden', getRoundedClass())}
                            style={{ height: imageHeight || 200 }}
                        >
                            {showOverlay && (
                                <LinearGradient
                                    colors={overlayGradient}
                                    className="relative flex h-full w-full flex-col justify-end"
                                >
                                    <View className="absolute right-0 bottom-0 left-0 p-4">
                                        <Text className="text-lg font-bold text-white">{title}</Text>
                                        {description && (
                                            <Text numberOfLines={1} className="text-sm text-white">
                                                {description}
                                            </Text>
                                        )}
                                        {(price || rating) && (
                                            <View className="mt-1 flex-row items-center justify-between">
                                                {renderPrice()}
                                                {renderRating()}
                                            </View>
                                        )}
                                    </View>
                                </LinearGradient>
                            )}
                        </ImageBackground>
                    ) : (
                        <View
                            style={{
                                height: imageHeight || 200,
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                            }}
                        >
                            <Image
                                source={typeof image === 'string' ? { uri: image } : image}
                                className={cn('h-full w-full overflow-hidden', getRoundedClass())}
                            />
                        </View>
                    )}
                    {renderBadge()}
                </View>

                {variant !== 'overlay' && (
                    <View className="w-full flex-1 p-3">
                        <Text className="mb-2 text-base font-semibold">{title}</Text>

                        {description && (
                            <Text numberOfLines={1} className="text-sm text-gray-600 dark:text-gray-300">
                                {description}
                            </Text>
                        )}
                        {(price || rating) && (
                            <View className="mt-auto flex-row items-center justify-between">
                                {renderPrice()}
                                {renderRating()}
                            </View>
                        )}
                        {children}
                        {button && (
                            <Button className="mt-3" size="sm" onPress={onButtonPress}>
                                <Text>{button}</Text>
                            </Button>
                        )}
                    </View>
                )}
            </View>
        );

        if (href) {
            return (
                <View style={{ width: width }}>
                    <TouchableOpacity
                        className={cn(variant === 'overlay' ? '!h-auto' : '', className)}
                        activeOpacity={0.8}
                        onPress={() => router.push(href)}
                    >
                        {cardContent}
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <TouchableOpacity
                className={`${variant === 'overlay' ? '!h-auto' : ''} ${className}`}
                activeOpacity={0.8}
                onPress={handlePress}
            >
                <View style={{ width: width }}>{cardContent}</View>
            </TouchableOpacity>
        );
    };

    return renderContent();
};

export default Card;
