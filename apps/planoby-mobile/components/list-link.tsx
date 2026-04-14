import { Icon, IconName } from '@kit/native-ui/icon';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import { Href, Link } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

interface ListLinkProps {
    icon?: IconName;
    title: string;
    description?: string;
    href?: Href;
    onPress?: () => void;
    showChevron?: boolean;
    className?: string;
    iconSize?: number;
    rightIcon?: IconName;
    disabled?: boolean;
    hasBorder?: boolean;
}

const ListLink: React.FC<ListLinkProps> = ({
    icon,
    title,
    description,
    href,
    onPress,
    showChevron = false,
    className = '',
    iconSize = 20,
    rightIcon = 'ChevronRight',
    disabled = false,
    hasBorder = false,
}) => {
    // Component for the actual content
    const Content = () => (
        <View className={cn('flex-row items-center py-5', className, disabled ? 'opacity-50' : '')}>
            {icon && (
                <View className="mr-4">
                    <Icon name={icon} size={iconSize} />
                </View>
            )}
            <View className="flex-1">
                <Text className="text-lg font-medium">{title}</Text>
                {description && <Text className="text-muted-foreground text-sm">{description}</Text>}
            </View>
            {showChevron && (
                <View className="opacity-40">
                    <Icon name={rightIcon} size={20} />
                </View>
            )}
        </View>
    );

    // If we have an href, make it a Link, otherwise a Pressable
    if (href && !disabled) {
        return (
            <Link href={href} asChild className={cn(hasBorder ? 'border-border border-b' : '')}>
                <Pressable>
                    <Content />
                </Pressable>
            </Link>
        );
    }

    return (
        <Pressable onPress={disabled ? undefined : onPress} className={cn(hasBorder ? 'border-border border-b' : '')}>
            <Content />
        </Pressable>
    );
};

export default ListLink;
