import { Icon } from '@kit/native-ui/icon';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import { type Href, Link } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { shadowPresets } from '~/utils/use-shadow';

export const SearchPressable: React.FC<{
    className?: string;
    href?: Href;
}> = ({ className, href = '/screens/search' }) => {
    return (
        <View className={cn('w-full', className)}>
            <Link href={href} asChild>
                <Pressable style={{ ...shadowPresets.card }}>
                    <View className="dark:bg-card/40 bg-accent/40 border-input relative w-full flex-row items-center gap-3 rounded-full border px-3 py-3">
                        <Icon name="Search" size={20} />
                        <Text className="text-foreground">Search here</Text>
                    </View>
                </Pressable>
            </Link>
        </View>
    );
};
