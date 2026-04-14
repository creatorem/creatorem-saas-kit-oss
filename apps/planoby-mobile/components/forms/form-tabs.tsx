import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

interface FormTabProps {
    title: string;
    isActive?: boolean;
    onPress?: () => void;
}

export function FormTab({ title, isActive, onPress }: FormTabProps) {
    return (
        <Pressable
            onPress={onPress}
            className={cn('flex-1 rounded-xl px-4 py-2.5', isActive ? 'bg-background shadow-lg' : 'bg-transparent')}
        >
            <Text
                className={cn(
                    'text-center text-base font-medium',
                    isActive ? 'text-black dark:text-black' : 'text-foreground',
                )}
            >
                {title}
            </Text>
        </Pressable>
    );
}

interface FormTabsProps {
    children: React.ReactElement<FormTabProps>[];
    defaultActiveTab?: string;
    onChange?: (tab: string) => void;
    className?: string;
    props?: any;
}

export default function FormTabs({ children, defaultActiveTab, onChange, className = '' }: FormTabsProps) {
    const [activeTab, setActiveTab] = useState(defaultActiveTab || children[0]?.props.title);

    return (
        <View className={cn('bg-secondary flex-row overflow-hidden rounded-xl p-1', className)}>
            {React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                    isActive: activeTab === child.props.title,
                    onPress: () => {
                        setActiveTab(child.props.title);
                        onChange?.(child.props.title);
                    },
                });
            })}
        </View>
    );
}
