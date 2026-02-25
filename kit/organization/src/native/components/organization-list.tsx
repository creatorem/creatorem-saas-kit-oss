import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Organization, OrganizationMember } from '@kit/drizzle';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/native-ui/avatar';
import { Badge } from '@kit/native-ui/badge';
import { Button } from '@kit/native-ui/button';
import { Icon } from '@kit/native-ui/icon';
import { Section } from '@kit/native-ui/layout/section';
import { TextInput } from '@kit/native-ui/react-native';
import { Skeleton } from '@kit/native-ui/skeleton';
import { Text } from '@kit/native-ui/text';
import { getInitials } from '@kit/utils';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { organizationRouter } from '../../router/router';
import { useOrganization } from '../../shared';

export type OrganizationListProps = {
    memberships: (OrganizationMember & {
        roleName: string;
        roleHierarchyLevel: number;
        organization: Organization;
    })[];
    refetch: () => void;
};

function OrganizationListInternal({ memberships }: OrganizationListProps): React.JSX.Element {
    const { setOrganization } = useOrganization();
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredOrganizations = memberships.filter(
        (o) =>
            !searchQuery ||
            o.organization.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 ||
            o.organization.slug.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1,
    );

    const handleSearchQueryChange = useCallback((text: string): void => {
        setSearchQuery(text || '');
    }, []);

    const changeOrganization = useCallback((organizationSlug: string) => {
        setOrganization(organizationSlug);
        router.push(`/(app)/(tabs)`);
    }, []);

    const goToCreateOrgPage = useCallback(() => {
        router.push('/onboarding/organization');
    }, []);

    return (
        <View style={{ flex: 1, display: 'flex', gap: 16 }}>
            <Section
                titleSize="xl"
                className="pt-4"
                title="Organizations"
                subtitle="Jump into an existing organization or add a new one."
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View className="relative flex-1">
                    <View
                        style={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                        }}
                    >
                        <Icon name="Search" size={16} />
                    </View>
                    <TextInput
                        className={'text-foreground border-border h-10 rounded-xl border px-3 pl-10'}
                        value={searchQuery}
                        onChangeText={handleSearchQueryChange}
                        textAlignVertical={'center'}
                        placeholder="Search..."
                    />
                </View>
                <Button onPress={goToCreateOrgPage} style={{ height: 40 }}>
                    <Icon name="Plus" size={16} />
                    <Text className="text-foreground">Add</Text>
                </Button>
            </View>

            {filteredOrganizations.length === 0 ? (
                <View style={{ alignItems: 'center', padding: 32 }}>
                    <Icon name="Store" size={24} />
                    <Text className="text-foreground text-center text-lg font-semibold">No organization found</Text>
                    <Text className="text-foreground text-center">
                        {searchQuery
                            ? 'Adjust your search query to show more.'
                            : 'Add your first organization to get started.'}
                    </Text>
                </View>
            ) : (
                <View style={{ gap: 12 }}>
                    {filteredOrganizations.map(({ organization, ...me }) => (
                        <Pressable
                            key={organization.id}
                            onPress={() => changeOrganization(organization.slug)}
                            className="border-border flex flex-row items-center justify-between rounded-xl border p-4"
                        >
                            <View className="flex flex-row items-center gap-2">
                                <Avatar alt={organization.name} className="h-8 w-8">
                                    <AvatarImage
                                        className="h-8 w-8"
                                        source={{ uri: organization?.logoUrl ?? undefined }}
                                    />
                                    <AvatarFallback>
                                        <View className="bg-muted my-auto flex h-8 w-8 items-center justify-center rounded-full">
                                            <Text className="text-foreground text-lg font-semibold">
                                                {getInitials(organization.name)}
                                            </Text>
                                        </View>
                                    </AvatarFallback>
                                </Avatar>
                                <View>
                                    <Text className="text-foreground font-semibold">{organization.name}</Text>
                                    <Text className="text-muted-foreground text-sm">/{organization.slug}</Text>
                                </View>
                            </View>
                            <View className="flex flex-row items-center gap-4">
                                {me.isOwner && (
                                    <Badge variant="default">
                                        <Icon name="Store" size={12} />
                                        <Text className="text-foreground">Owner</Text>
                                    </Badge>
                                )}
                                <Badge variant="outline" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Icon name="User" size={12} />
                                    <Text className="text-foreground">{me.roleName}</Text>
                                </Badge>
                                <Icon name="ChevronRight" size={16} />
                            </View>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
}

export function OrganizationList({
    clientTrpc,
}: {
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
}): React.JSX.Element {
    const membershipsRes = clientTrpc.organizationUserMemberships.useQuery();

    if (membershipsRes.isPending || !membershipsRes.data) {
        return <Skeleton className="h-48 w-full" />;
    }

    return <OrganizationListInternal memberships={membershipsRes.data} refetch={membershipsRes.refetch} />;
}
