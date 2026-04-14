import { ScrollView } from '@kit/native-ui/react-native';
import { Text } from '@kit/native-ui/text';
import { View } from 'react-native';
import { Avatar } from './avatar';
import { Chip } from './chip';

export default function ChipExamples() {
    return (
        <ScrollView className="flex-1 p-4">
            <Text className="mb-4 text-2xl font-bold">Chip Sizes</Text>
            <View className="mb-6 flex-row flex-wrap gap-2">
                <Chip label="Extra Small" size="xs" />
                <Chip label="Small" size="sm" />
                <Chip label="Medium" size="md" />
                <Chip label="Large" size="lg" />
                <Chip label="Extra Large" size="xl" />
                <Chip label="2XL" size="xxl" />
            </View>

            <Text className="mb-4 text-2xl font-bold">Selected State</Text>
            <View className="mb-6 flex-row flex-wrap gap-2">
                <Chip label="Not Selected" />
                <Chip label="Selected" isSelected />
            </View>

            <Text className="mb-4 text-2xl font-bold">With Icons</Text>
            <View className="mb-6 flex-row flex-wrap gap-2">
                <Chip label="Home" icon="Store" />
                <Chip label="Settings" icon="Settings" isSelected />
                <Chip label="Search" icon="Search" size="lg" />
                <Chip label="Notifications" icon="Bell" size="xl" isSelected />
            </View>

            <Text className="mb-4 text-2xl font-bold">With Images</Text>
            <View className="mb-6 flex-row flex-wrap gap-2">
                <Chip
                    label="John Doe"
                    image={{
                        uri: 'https://mighty.tools/mockmind-api/content/human/108.jpg',
                    }}
                />
                <Chip
                    label="Jane Smith"
                    image={{
                        uri: 'https://mighty.tools/mockmind-api/content/human/107.jpg',
                    }}
                    isSelected
                />
                <Chip
                    label="Mike Johnson"
                    image={{
                        uri: 'https://mighty.tools/mockmind-api/content/human/106.jpg',
                    }}
                    size="lg"
                />
            </View>

            <Text className="mb-4 text-2xl font-bold">As Links</Text>
            <View className="mb-6 flex-row flex-wrap gap-2">
                <Chip label="Go to Home" href="/" icon="Store" />
                <Chip label="Profile" href="/profile" icon="User" isSelected />
                <Chip label="Settings" href="/settings" icon="Settings" size="lg" />
            </View>

            <Text className="mb-4 text-2xl font-bold">With Custom Left Content</Text>
            <View className="mb-6 flex-row flex-wrap gap-2">
                <Chip
                    label="Custom Avatar"
                    leftContent={
                        <Avatar
                            src="https://mighty.tools/mockmind-api/content/human/105.jpg"
                            size="xs"
                            className="mr-2"
                        />
                    }
                    size="lg"
                />
                <Chip
                    label="Custom Badge"
                    leftContent={<View className="mr-2 h-3 w-3 rounded-full bg-red-500" />}
                    isSelected
                />
            </View>
        </ScrollView>
    );
}
