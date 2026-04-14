// import { Icon } from "@kit/native-ui/icon";
import { Button } from '@kit/native-ui/button';
import { Icon } from '@kit/native-ui/icon';
import { Header } from '@kit/native-ui/layout/header';
import { Text } from '@kit/native-ui/text';
import { Link, Stack } from 'expo-router';
import { Dimensions, View } from 'react-native';

const windowWidth = Dimensions.get('window').width;
export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen />
            <Header title=" " showBackButton />
            <View className="bg-background flex-1 items-center justify-center p-4">
                <View className="mb-8">
                    <Icon name="AlertCircle" strokeWidth={1} size={70} />
                </View>
                <Text className="mb-2 text-3xl font-bold">Page Not Found</Text>
                <Text className="text-muted-foreground mb-8 w-2/3 text-center text-lg">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </Text>
                <View className="flex-row items-center justify-center">
                    <Link href="/" asChild>
                        <Button className="px-6">
                            <Text>Back to Home</Text>
                        </Button>
                    </Link>
                </View>
            </View>
        </>
    );
}
