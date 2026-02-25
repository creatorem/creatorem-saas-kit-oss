import { Avatar, AvatarFallback, AvatarImage } from '@kit/native-ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@kit/native-ui/dropdown-menu';
import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon } from '@kit/native-ui/icon';
import { Text } from '@kit/native-ui/text';
import { useOrganization } from '@kit/organization/shared';
import { cn, getInitials } from '@kit/utils';
import { router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OrganizationSwitcherTriggerProps extends React.ComponentPropsWithoutRef<'div'> {
    organization: {
        name: string;
        logoUrl?: string | null;
    };
    smallLogo?: boolean;
}

const OrganizationSwitcherTrigger: React.FC<OrganizationSwitcherTriggerProps> = ({
    organization,
    smallLogo = false,
}) => {
    return (
        <View className={cn('border-input flex flex-row gap-2 rounded-xl border', smallLogo ? 'p-1' : 'p-2 pr-3')}>
            <Avatar alt={organization.name} className={cn('aspect-square size-8 rounded-md')}>
                <AvatarImage className="rounded-md" src={organization.logoUrl ?? undefined} />
                <AvatarFallback className="text-foreground bg-input/20 border-border flex size-8 items-center justify-center rounded-md border font-medium">
                    <Text>{getInitials(organization.name)}</Text>
                </AvatarFallback>
            </Avatar>
            {!smallLogo && (
                <View className="flex flex-1 flex-row items-center gap-1 overflow-hidden">
                    <Text className="truncate text-sm leading-tight font-semibold">{organization.name}</Text>
                    <Icon name="ChevronDown" className="text-muted-foreground ml-auto size-4 shrink-0" size={20} />
                </View>
            )}
        </View>
    );
};

interface OrganizationSwitcherProps {
    onClose?: () => void;
    className?: string;
    triggerWrapper?: (trigger: React.ReactNode) => React.ReactNode;
    smallLogo?: boolean;
}

export function OrganizationSwitcher({
    onClose,
    className,
    triggerWrapper,
    smallLogo = false,
}: OrganizationSwitcherProps): React.JSX.Element {
    const { organization, userMemberships, setOrganization } = useOrganization();
    const colors = useThemeColors();
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredOrgMemberships = useMemo(() => {
        if (searchTerm.length > 1) {
            return userMemberships.filter(({ organization: o }) =>
                o.name.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        return userMemberships;
    }, [userMemberships, searchTerm]);

    const handleOpenChange = useCallback((open: boolean): void => {
        if (open) {
            setSearchTerm('');
        }
    }, []);

    const insets = useSafeAreaInsets();
    const contentInsets = {
        top: insets.top,
        bottom: insets.bottom,
        left: 4,
        right: 4,
    };

    const defaultTrigger = (
        <OrganizationSwitcherTrigger organization={organization} className={className} smallLogo={smallLogo} />
    );

    const trigger = triggerWrapper ? triggerWrapper(defaultTrigger) : defaultTrigger;

    return (
        <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent
                insets={contentInsets}
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-md"
                align="center"
                side="bottom"
                sideOffset={4}
            >
                <View className="relative">
                    <View
                        style={{
                            position: 'absolute',
                            top: 8,
                            left: 6,
                        }}
                    >
                        <Icon name="Search" size={16} />
                    </View>
                    <TextInput
                        className={'text-foreground border-border h-8 rounded-xl border px-3 pl-6'}
                        value={searchTerm}
                        onChangeText={(text) => setSearchTerm(text)}
                        placeholderTextColor={colors.placeholder}
                        textAlignVertical={'center'}
                        placeholder="Search..."
                    />
                </View>
                <DropdownMenuSeparator />
                {filteredOrgMemberships.length === 0 ? (
                    <Text className="text-muted-foreground p-2 text-sm">No organization found</Text>
                ) : (
                    <View className="-mr-1 pr-1 [&>[data-radix-scroll-area-viewport]]:max-h-[200px]">
                        {filteredOrgMemberships.map(({ organization: orgOfMember, id }) => (
                            <DropdownMenuItem
                                key={id}
                                className="cursor-pointer gap-2 p-2"
                                onPress={() => {
                                    setOrganization(orgOfMember.slug);
                                    onClose?.();
                                }}
                            >
                                <Avatar alt={orgOfMember.name}>
                                    <AvatarImage
                                        className="h-4 rounded-md"
                                        // className="h-6 min-w-6 rounded-md"
                                        src={orgOfMember.logoUrl ?? undefined}
                                    />
                                    <AvatarFallback className="bg-muted border-border flex items-center justify-center rounded-xs border px-1 font-medium">
                                        <Text className="text-foreground">{getInitials(orgOfMember.name)}</Text>
                                    </AvatarFallback>
                                </Avatar>

                                <Text className="text-foreground">{orgOfMember.name}</Text>
                                {orgOfMember.id === organization.id && (
                                    <View className="text-primary-foreground ml-auto flex items-center justify-center rounded-full bg-blue-500 p-1">
                                        <Icon name="Check" size={12} />
                                    </View>
                                )}
                            </DropdownMenuItem>
                        ))}
                    </View>
                )}

                {userMemberships.length > 1 && (
                    <DropdownMenuItem
                        className="text-muted-foreground cursor-pointer gap-2 p-2"
                        onPress={() => {
                            router.push('/screens/all-organizations/');
                            onClose?.();
                        }}
                    >
                        <Icon name="MoreHorizontal" size={20} />
                        <Text className="text-foreground">All organizations</Text>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer gap-2 p-2"
                    onPress={() => {
                        router.push('/screens/settings/');
                        onClose?.();
                    }}
                >
                    <Icon name="User" size={20} />
                    <Text className="text-foreground">Account settings</Text>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer gap-2 p-2"
                    onPress={() => {
                        router.push('/screens/settings/organization');
                        onClose?.();
                    }}
                >
                    <Icon name="Settings2" size={20} />
                    <Text className="text-foreground">Organization settings</Text>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer gap-2 p-2"
                    onPress={() => {
                        router.push('/onboarding/organization');
                        onClose?.();
                    }}
                >
                    <Icon name="Plus" size={20} />
                    <Text className="text-foreground">Add organization</Text>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
