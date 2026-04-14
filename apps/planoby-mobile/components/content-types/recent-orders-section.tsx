import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/native-ui/empty';
import { Icon } from '@kit/native-ui/icon';
import { Section } from '@kit/native-ui/layout/section';
import { Skeleton } from '@kit/native-ui/skeleton';
import { Text } from '@kit/native-ui/text';
import { useOrganization } from '@kit/organization/shared';
import { useCtxTrpc } from '@planoby/shared/trpc-client-provider';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';

const SIZE = 5;

interface RecentBookingsProps {
    bookings: Array<{
        id: string;
        firstname: string;
        lastname: string | null;
        state: string;
        createdAt: string | Date | null;
    }>;
    isLoading: boolean;
}

const RecentBookings: React.FC<RecentBookingsProps> = ({ bookings, isLoading }) => {
    const { t } = useTranslation('common');

    if (isLoading) {
        return (
            <View className="flex gap-3">
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
            </View>
        );
    }

    if (bookings.length === 0) {
        return (
            <Empty className="flex-1">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Icon name="CalendarCheck" size={32} />
                    </EmptyMedia>
                    <EmptyTitle>{t('dashboard.emptyBookings')}</EmptyTitle>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <View>
            {bookings.map((booking) => (
                <Link key={booking.id} href={`/screens/booking-single?id=${booking.id}`} asChild>
                    <TouchableOpacity activeOpacity={0.8}>
                        <View className="dark:bg-card/40 bg-accent/40 border-border mb-3 rounded-xl border p-5">
                            <View className="mb-1 flex-row items-center justify-between">
                                <Text className="mr-2 flex-1 text-xl font-semibold">
                                    {booking.firstname} {booking.lastname ?? ''}
                                </Text>
                                <View className="flex-row items-center">
                                    <Text className="text-sm opacity-60">{booking.state}</Text>
                                    <View className="ml-2 h-2 w-2 rounded-full bg-green-500/90" />
                                </View>
                            </View>
                            <View className="mb-2 flex-row items-center">
                                <Icon name="Calendar" size={14} className="mr-1 opacity-60" />
                                <Text className="text-base opacity-60">
                                    {String(booking.createdAt ?? '').match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? ''}
                                </Text>
                            </View>
                            <View className="mt-2 flex-row items-center justify-end">
                                <Icon name="ChevronRight" size={16} className="ml-2 opacity-60" />
                            </View>
                        </View>
                    </TouchableOpacity>
                </Link>
            ))}
        </View>
    );
};

export const RecentBookingsSection: React.FC = () => {
    const { t } = useTranslation('common');
    const { organization } = useOrganization();
    const { clientTrpc } = useCtxTrpc();

    const { data: bookingsData, isPending: bookingsLoading } = useInfiniteQuery({
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
    });

    const recentBookings = useMemo(() => {
        if (!bookingsData?.pages?.[0]) return [];
        return bookingsData.pages[0].bookingsData.slice(0, 3) as RecentBookingsProps['bookings'];
    }, [bookingsData]);

    return (
        <>
            <Section
                titleSize="lg"
                className="mb-2"
                title={t('dashboard.recentBookings')}
                link="/(app)/(tabs)/bookings"
                linkText={t('dashboard.viewAll')}
            />
            <RecentBookings bookings={recentBookings} isLoading={bookingsLoading} />
        </>
    );
};
