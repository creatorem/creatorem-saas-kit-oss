import { Button } from '@kit/native-ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/native-ui/empty';
import { Icon } from '@kit/native-ui/icon';
import { Header } from '@kit/native-ui/layout/header';
import { Section } from '@kit/native-ui/layout/section';
import { TouchableOpacity } from '@kit/native-ui/react-native';
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
const BOOKING_STATES = [
    'all',
    'requires_slot_confirmation',
    'requires_payment_method',
    'confirmed',
    'charged',
    'canceled',
    'confirmation_failed',
    'partially_refunded',
    'refunded',
] as const;

type BookingStateFilter = (typeof BOOKING_STATES)[number];

const labelFromState = (value: string) =>
    value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (match) => match.toUpperCase());

export default function BookingsScreen() {
    const { t } = useTranslation('common');
    const { organization, permissions } = useOrganization();
    const [selectedState, setSelectedState] = useState<BookingStateFilter>('all');

    const canRead = permissions.includes('booking.select');
    const canCreate = permissions.includes('booking.insert');

    const { data, isPending, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
        queryKey: ['archiveBookingsInfinite', organization.id],
        queryFn: async ({ pageParam: { page } }) => {
            const res = await clientTrpc.archiveBookings.fetch({
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
                <Header title={t('bookings.title')} />
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
    const bookingsData = data.pages.reduce<Awaited<ReturnType<typeof clientTrpc.archiveBookings.fetch>>['bookingsData']>(
        (acc, el) => [...acc, ...el.bookingsData],
        [],
    );

    const filteredBookings =
        selectedState === 'all' ? bookingsData : bookingsData.filter((booking) => booking.state === selectedState);

    if (!bookingsData.length) {
        return (
            <View className="bg-background flex-1">
                <AnimatedView animation="scaleIn">
                    <Header />
                    <ThemedScroller>
                        <Section
                            titleSize="3xl"
                            className="my-16"
                            title={t('bookings.title')}
                            subtitle={t('bookings.subtitle')}
                        />
                        {canCreate ? (
                            <Link href="/screens/booking-single?isNew=true">
                                <Button size="sm">
                                    <Icon name="Plus" size={16} />
                                    <Text>{t('bookings.new')}</Text>
                                </Button>
                            </Link>
                        ) : null}

                        <Empty className="flex-1">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Icon name="CalendarCheck" className="size-6" />
                                </EmptyMedia>
                                <EmptyTitle>{t('bookings.empty')}</EmptyTitle>
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
                            <Text className="text-foreground text-xl font-bold">{t('bookings.title')}</Text>
                            <Text className="text-muted-foreground mt-1 text-sm">
                                {isFetchingNextPage
                                    ? t('loading')
                                    : t('bookings.totalFiltered', {
                                        totalCount,
                                        filteredCount: filteredBookings.length,
                                    })}
                            </Text>
                        </View>
                    }
                    rightComponents={
                        canCreate
                            ? [
                                <TouchableOpacity
                                    key="create-booking"
                                    onPress={() => router.push('/screens/booking-single?isNew=true')}
                                >
                                    <Icon name="Plus" size={24} />
                                </TouchableOpacity>,
                            ]
                            : undefined
                    }
                />

                <View className="flex-1 px-0">
                    <FlatList
                        data={filteredBookings}
                        keyExtractor={(item) => item.id}
                        onEndReached={onLoadMore}
                        onEndReachedThreshold={0.5}
                        refreshControl={<RefreshControl refreshing={isFetchingNextPage} />}
                        ListHeaderComponent={
                            <CardScroller className="mx-4 mb-3" space={5}>
                                {BOOKING_STATES.map((status) => (
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
                        renderItem={({ item: booking }) => (
                            <Link key={booking.id} href={`/screens/booking-single?id=${booking.id}`} asChild>
                                <TouchableOpacity activeOpacity={0.8}>
                                    <View className="dark:bg-card/40 bg-accent/40 border-border mx-4 mb-3 rounded-xl border p-5">
                                        <View className="mb-1 flex-row items-center justify-between">
                                            <Text className="mr-2 flex-1 text-xl font-semibold">
                                                {booking.firstname} {booking.lastname ?? ''}
                                            </Text>
                                            <View className="flex-row items-center">
                                                <Text className="text-sm opacity-60">{labelFromState(booking.state)}</Text>
                                                <View className="ml-2 h-2 w-2 rounded-full bg-green-500/90" />
                                            </View>
                                        </View>

                                        <View className="mb-2 flex-row items-center">
                                            <Icon name="Package" size={14} className="mr-1 opacity-60" />
                                            <Text className="text-base opacity-60">{booking.serviceName ?? t('bookings.noService')}</Text>
                                        </View>

                                        <View className="mb-2 flex-row items-center">
                                            <Icon name="Calendar" size={14} className="mr-1 opacity-60" />
                                            <Text className="text-base opacity-60">
                                                {String(booking.createdAt ?? '').match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? ''}
                                            </Text>
                                        </View>

                                        <View className="mt-2 flex-row items-center justify-end">
                                            <Text className="text-lg font-bold">#{booking.relativeId ?? '-'}</Text>
                                            <Icon name="ChevronRight" size={16} className="ml-2 opacity-60" />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Link>
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                </View>
            </AnimatedView>
        </View>
    );
}
