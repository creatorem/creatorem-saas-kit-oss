import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { TouchableOpacity } from '@kit/native-ui/react-native';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import { Href, Link } from 'expo-router';
import { Dimensions, View } from 'react-native';
import ImageCarousel from './image-carousel';

const windowWidth = Dimensions.get('window').width;

interface SliderCardProps {
    title: string;
    description?: string;
    image: string | string[];
    href: Href;
    className?: string;
    button?: string;
    rating?: string;
    distance?: any;
    price?: string;
}

const SliderCard = ({
    title,
    description,
    image,
    href,
    rating,
    distance,
    price,
    className = '',
    ...props
}: SliderCardProps) => {
    const colors = useThemeColors();
    const images = Array.isArray(image) ? image : [image];

    return (
        <View className={cn('bg-background mb-0 w-full p-4', className)} {...props}>
            <View className="relative w-full">
                <ImageCarousel
                    images={images}
                    height={300}
                    //width={windowWidth - 32}
                    rounded="xl"
                    className="rounded-2xl"
                />
            </View>
            <Link href={href} asChild>
                <TouchableOpacity>
                    <View className="mt-2 w-full flex-row items-center justify-between">
                        <Text className="text-lg font-semibold">{title}</Text>
                        {rating && (
                            <View className="flex-row items-center">
                                <MaterialIcons name="star" size={18} color={colors['--color-foreground']} />
                                <Text className="ml-px text-lg">{rating}</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-muted-foreground text-base">{distance} miles away</Text>
                    <Text className="mt-2 text-lg font-bold">
                        {price} <Text className="font-normal">night</Text>
                    </Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
};

export default SliderCard;
