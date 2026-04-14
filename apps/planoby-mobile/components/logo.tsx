import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import React from 'react';
import { View } from 'react-native';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <View className={cn('flex flex-row', className)}>
            <Text className={'text-foreground font-heading ios:leading-0 text-xl whitespace-nowrap uppercase'}>
                Creatorem
            </Text>
            <View className="bg-primary ios:mb-2 mt-auto mb-0.5 ml-1 h-2 w-2 rounded-full" />
        </View>
    );
};
