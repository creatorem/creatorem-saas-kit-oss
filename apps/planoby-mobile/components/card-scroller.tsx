import { ScrollView } from '@kit/native-ui/react-native';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import { type Href, Link } from 'expo-router';
import { View } from 'react-native';

// Define prop types
interface CardScrollerProps {
    title?: string;
    img?: string;
    allUrl?: Href;
    children: React.ReactNode;
    enableSnapping?: boolean;
    snapInterval?: number;
    className?: string;
    space?: number;
}

export const CardScroller = ({
    title,
    img,
    allUrl,
    children,
    enableSnapping = false,
    snapInterval = 0,
    className,
    space = 10,
}: CardScrollerProps) => {
    return (
        <View className={cn('flex w-full flex-col', title ? 'pt-4' : 'pt-0', className)}>
            <View className={cn('flex w-full flex-row items-center justify-between', title ? 'mb-2' : 'mb-0')}>
                {title && <Text className="text-lg font-bold dark:text-white">{title}</Text>}
                {allUrl && (
                    <View className="flex flex-col">
                        <Link href={allUrl} className="dark:text-white">
                            See all
                        </Link>
                        <View className="mt-[1px] h-px w-full bg-black dark:bg-white" />
                    </View>
                )}
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToAlignment="center"
                decelerationRate={enableSnapping ? 0.85 : 'normal'}
                snapToInterval={enableSnapping ? snapInterval : undefined}
                className={`-mx-4 px-4`}
                contentContainerStyle={{ columnGap: space }}
            >
                {children}
                <View className="h-px w-4" />
            </ScrollView>
        </View>
    );
};
