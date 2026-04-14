import { Button } from '@kit/native-ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/native-ui/empty';
import { Icon } from '@kit/native-ui/icon';
import { Header } from '@kit/native-ui/layout/header';
import { Section } from '@kit/native-ui/layout/section';
import { Image, TouchableOpacity } from '@kit/native-ui/react-native';
import { Skeleton } from '@kit/native-ui/skeleton';
import { Text } from '@kit/native-ui/text';
import { ThemedScroller } from '@kit/native-ui/themed-scroller';
import { useOrganization } from '@kit/organization/shared';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import AnimatedView from '~/components/animated-view';
import { CardScroller } from '~/components/card-scroller';
import { Chip } from '~/components/chip';
import { clientTrpc } from '~/utils/trpc-client';

const SIZE = 50;
const SERVICE_STATES = ['all', 'draft', 'published', 'archived'] as const;
type ServiceStateFilter = (typeof SERVICE_STATES)[number];

const labelFromState = (value: string) =>
    value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (match) => match.toUpperCase());

export default function ServicesScreen() {
    const { t } = useTranslation('common');
    const { organization, permissions } = useOrganization();
    const [selectedState, setSelectedState] = useState<ServiceStateFilter>('all');

    const canRead = permissions.includes('service.select');
    const canCreate = permissions.includes('service.insert');

    const { data, isPending, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
        queryKey: ['archiveServicesInfinite', organization.id],
        queryFn: async ({ pageParam: { page } }) => {
            const res = await clientTrpc.archiveServices.fetch({
                page,
                pageSize: SIZE,
                orgId: organization.id,
            });
            return { ...res, nextPage: page + 1 };
        },
        initialPageParam: { page: 1 },
        getNextPageParam: (lastRes) => {
            if ((lastRes.nextPage - 1) * SIZE >= lastRes.totalCount) {
                return null;
            }

            return {
                page: lastRes.nextPage,
            };
        },
        enabled: canRead,
    });

    if (!canRead) {
        return (
            <View className="bg-background flex-1">
                <Header title={t('services.title')} />
                <Empty className="flex-1">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Icon name="AlertCircle" className="size-6" />
                        </EmptyMedia>
                        <EmptyTitle>{t('permissions.noAccess')}</EmptyTitle>
                    </EmptyHeader>
                </Empty>
            </View>
        );
    }

    if (!data || isPending) {
        return (
            <View className="bg-background flex-1">
                <AnimatedView animation="scaleIn">
                    <Header />
                    <ThemedScroller>
                        <View className="mt-3 flex flex-row gap-2">
                            <Skeleton className="h-6 w-16 rounded-2xl" />
                            <Skeleton className="h-6 w-16 rounded-2xl" />
                            <Skeleton className="h-6 w-16 rounded-2xl" />
                        </View>

                        <View className="mt-4 flex gap-4">
                            <Skeleton className="h-28 flex-1 rounded-2xl" />
                            <Skeleton className="h-28 flex-1 rounded-2xl" />
                            <Skeleton className="h-28 flex-1 rounded-2xl" />
                        </View>
                    </ThemedScroller>
                </AnimatedView>
            </View>
        );
    }

    const totalCount = data.pages[0]!.totalCount;
    const servicesData = data.pages.reduce<Awaited<ReturnType<typeof clientTrpc.archiveServices.fetch>>['servicesData']>(
        (acc, el) => [...acc, ...el.servicesData],
        [],
    );

    const filteredServices =
        selectedState === 'all' ? servicesData : servicesData.filter((service) => service.state === selectedState);

    if (!servicesData.length) {
        return (
            <View className="bg-background flex-1">
                <AnimatedView animation="scaleIn">
                    <Header />
                    <ThemedScroller>
                        <Section titleSize="3xl" className="my-16" title={t('services.title')} subtitle={t('services.subtitle')} />
                        {canCreate ? (
                            <Link href="/screens/service-single?isNew=true">
                                <Button size="sm">
                                    <Icon name="Plus" size={16} />
                                    <Text>{t('services.new')}</Text>
                                </Button>
                            </Link>
                        ) : null}

                        <Empty className="mt-8 flex-1">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Icon name="Package" className="size-6" />
                                </EmptyMedia>
                                <EmptyTitle>{t('services.empty')}</EmptyTitle>
                            </EmptyHeader>
                        </Empty>
                    </ThemedScroller>
                </AnimatedView>
            </View>
        );
    }

    const onLoadMore = useCallback(() => {
        if (!isFetchingNextPage && hasNextPage) {
            fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    return (
        <View className="bg-background flex-1">
            <AnimatedView animation="scaleIn">
                <Header
                    leftComponent={
                        <View className="relative z-50 flex-row items-center gap-2 py-4">
                            <Text className="text-foreground text-xl font-bold">{t('services.title')}</Text>
                            <Text className="text-muted-foreground mt-1 text-sm">
                                {isFetchingNextPage
                                    ? t('loading')
                                    : t('services.totalFiltered', {
                                          totalCount,
                                          filteredCount: filteredServices.length,
                                      })}
                            </Text>
                        </View>
                    }
                    rightComponents={
                        canCreate
                            ? [
                                  <TouchableOpacity key="add" onPress={() => router.push('/screens/service-single?isNew=true')}>
                                      <Icon name={'PackagePlus'} size={24} />
                                  </TouchableOpacity>,
                              ]
                            : undefined
                    }
                />
                <View className="flex-1 px-2">
                    <FlatList
                        data={filteredServices}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        onEndReached={onLoadMore}
                        onEndReachedThreshold={0.5}
                        refreshControl={<RefreshControl refreshing={isFetchingNextPage} />}
                        ListHeaderComponent={
                            <CardScroller className="mx-2 mb-3" space={5}>
                                {SERVICE_STATES.map((status) => (
                                    <Chip
                                        key={status}
                                        label={status === 'all' ? t('filters.all') : labelFromState(status)}
                                        isSelected={selectedState === status}
                                        onPress={() => setSelectedState(status)}
                                    />
                                ))}
                            </CardScroller>
                        }
                        ListFooterComponent={
                            isFetchingNextPage ? (
                                <View className="py-4">
                                    <ActivityIndicator size="small" />
                                </View>
                            ) : null
                        }
                        renderItem={({ item: service, index }) => (
                            <Link key={service.id} href={`/screens/service-single?id=${service.id}`} asChild>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={{
                                        flex: 0.5,
                                        paddingInline: 8,
                                        transform: index % 2 === 1 ? 'translateY(28px)' : undefined,
                                    }}
                                >
                                    <View className="bg-secondary/70 border-border relative mb-4 aspect-square w-full rounded-2xl border">
                                        {service.featuredImage ? (
                                            <Image
                                                source={{ uri: service.featuredImage }}
                                                className="absolute top-0 left-0 h-full w-full rounded-lg"
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View className="bg-muted h-full w-full items-center justify-center rounded-lg">
                                                <Icon name="Package" size={24} className="opacity-60" />
                                            </View>
                                        )}

                                        <View className="bg-background/60 absolute bottom-0 flex-row px-2 pt-1">
                                            <View className="flex-1">
                                                <View className="mb-1 flex-row items-center justify-between">
                                                    <Text className="mr-2 flex-1 text-lg font-semibold" numberOfLines={1}>
                                                        {service.name}
                                                    </Text>
                                                </View>

                                                {service.description ? (
                                                    <Text className="mb-2 text-sm opacity-60" numberOfLines={2}>
                                                        {service.description}
                                                    </Text>
                                                ) : null}
                                                <Text className="mb-2 text-xs opacity-60">{labelFromState(service.state)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Link>
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
                    />
                </View>
            </AnimatedView>
        </View>
    );
}
