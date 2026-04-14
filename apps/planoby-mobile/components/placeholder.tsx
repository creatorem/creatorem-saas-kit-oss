import { Button } from '@kit/native-ui/button';
import { Icon, IconName } from '@kit/native-ui/icon';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import { Href } from 'expo-router';
import { View } from 'react-native';

interface PlaceholderProps {
    title: string;
    subtitle?: string;
    button?: string;
    href?: Href;
    icon?: IconName;
    className?: string;
}

export function Placeholder({ title, subtitle, button, href, icon = 'Inbox', className = '' }: PlaceholderProps) {
    return (
        <View className={cn('bg-background items-center justify-center p-4', className)}>
            <View className="border-border mb-4 h-20 w-20 items-center justify-center rounded-full border">
                <Icon name={icon} size={30} className="text-muted-foreground" />
            </View>

            <Text className="text-center text-2xl font-bold">{title}</Text>

            {subtitle && <Text className="text-muted-foreground mb-4 text-center">{subtitle}</Text>}

            {button && href && (
                <Button className="mt-4 rounded-full" variant="ghost" href={href}>
                    {button}
                </Button>
            )}
        </View>
    );
}
