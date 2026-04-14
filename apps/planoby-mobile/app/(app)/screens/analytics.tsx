import { useUser } from '@kit/auth/shared/user';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/native-ui/empty';
import { Icon } from '@kit/native-ui/icon';
import { Header } from '@kit/native-ui/layout/header';
import { Section } from '@kit/native-ui/layout/section';
import { Skeleton } from '@kit/native-ui/skeleton';
import { Text } from '@kit/native-ui/text';
import { ThemedScroller } from '@kit/native-ui/themed-scroller';
import { useOrganization } from '@kit/organization/shared';
import { useQueries } from '@tanstack/react-query';
import { FilterApplier } from '@kit/utils/filters';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import AnimatedView from '~/components/animated-view';
import { Chip } from '~/components/chip';
import { Logo } from '~/components/logo';
import NotificationIcon from '~/components/notification-icon';
import { SearchPressable } from '~/components/search-pressable';
import { clientTrpc } from '~/utils/trpc-client';

function toDateString(date: Date) {
    return date.toISOString().slice(0, 10);
}

function subDays(base: Date, days: number) {
    const next = new Date(base);
    next.setDate(next.getDate() - days);
    return next;
}

type DateRange = 7 | 30 | 90;
type BookingsArchiveResponse = Awaited<ReturnType<typeof clientTrpc.archiveBookings.fetch>>;
type ServicesArchiveResponse = Awaited<ReturnType<typeof clientTrpc.archiveServices.fetch>>;
type CheckoutsArchiveResponse = Awaited<ReturnType<typeof clientTrpc.archiveCheckouts.fetch>>;
type CheckoutViewsResponse = Awaited<ReturnType<typeof clientTrpc.checkoutPageViewAnalytics.fetch>>;

function StatCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: string | number;
    icon: React.ComponentProps<typeof Icon>['name'];
}) {
    return (
        <View className="dark:bg-card/40 bg-accent/40 border-border mb-3 flex-1 rounded-2xl border p-4">
            <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-muted-foreground text-sm">{title}</Text>
                <Icon name={icon} size={16} />
            </View>
            <Text className="text-2xl font-bold">{value}</Text>
        </View>
    );
}

export default function AnalyticsScreen() {
    const { t } = useTranslation('common');
    const user = useUser();
    const { organization, permissions } = useOrganization();
    const [range, setRange] = useState<DateRange>(30);

    const canRead =
        permissions.includes('booking.select') || permissions.includes('checkout.select') || permissions.includes('service.select');

    const endDate = useMemo(() => toDateString(new Date()), []);
    const startDate = useMemo(() => toDateString(subDays(new Date(), range - 1)), [range]);

    const rightComponents = [<NotificationIcon key="notifications" />];
    const middleComponent = [<Logo key="app-title" className="mx-auto" />];
    const leftComponent = [
        <FilterApplier name="display_sidebar_logo_name" key="sidebar-logo">
            <View className="min-w-12" />
        </FilterApplier>,
    ];

    useEffect(() => {
        return () => {
            void SplashScreen.hideAsync();
        };
    });

    const results = useQueries({
        queries: [
            {
                queryKey: ['analytics-bookings', organization.id],
                queryFn: async (): Promise<BookingsArchiveResponse> => {
                    const response = await clientTrpc.archiveBookings.fetch({ orgId: organization.id, page: 1, pageSize: 200 });
                    return await response;
                },
                enabled: canRead,
            },
            {
                queryKey: ['analytics-services', organization.id],
                queryFn: async (): Promise<ServicesArchiveResponse> => {
                    const response = await clientTrpc.archiveServices.fetch({ orgId: organization.id, page: 1, pageSize: 200 });
                    return await response;
                },
                enabled: canRead,
            },
            {
                queryKey: ['analytics-checkouts', organization.id],
                queryFn: async (): Promise<CheckoutsArchiveResponse> => {
                    const response = await clientTrpc.archiveCheckouts.fetch({
                        orgId: organization.id,
                        page: 1,
                        pageSize: 200,
                    });
                    return await response;
                },
                enabled: canRead,
            },
            {
                queryKey: ['analytics-checkout-page-views', organization.id, startDate, endDate],
                queryFn: async (): Promise<CheckoutViewsResponse> => {
                    const response = await clientTrpc.checkoutPageViewAnalytics.fetch({
                        orgId: organization.id,
                        startDate,
                        endDate,
                    });
                    return await response;
                },
                enabled: canRead,
            },
        ],
    });

    const [bookingsQuery, servicesQuery, checkoutsQuery, checkoutViewsQuery] = results;
    const isLoading = results.some((result) => result.isPending);

    const bookings = bookingsQuery.data?.bookingsData ?? [];
    const bookingTotal = bookingsQuery.data?.totalCount ?? 0;
    const servicesTotal = servicesQuery.data?.totalCount ?? 0;
    const checkoutsTotal = checkoutsQuery.data?.totalCount ?? 0;
    const checkoutViews = checkoutViewsQuery.data?.totalViews ?? 0;
    const checkoutUniqueSessions = checkoutViewsQuery.data?.uniqueSessions ?? 0;
    const checkoutDaily = checkoutViewsQuery.data?.daily ?? [];

    const chargedCount = bookings.filter((booking) => booking.state === 'charged').length;
    const confirmedCount = bookings.filter((booking) => booking.state === 'confirmed').length;
    const requiresActionCount = bookings.filter(
        (booking) => booking.state === 'requires_payment_method' || booking.state === 'requires_slot_confirmation',
    ).length;

    return (
        <View className="bg-background flex-1">
            <Header leftComponent={leftComponent} rightComponents={rightComponents} middleComponent={middleComponent} />

            <ThemedScroller scrollEventThrottle={16} className="px-4">
                <AnimatedView animation="scaleIn">
                    <SearchPressable className="mt-4 mb-8" />

                    <Section titleSize="2xl" className="mb-6" title={t('welcome', { userName: user?.name ?? '' })} />

                    {!canRead ? (
                        <Empty className="h-[50vh] border border-dashed border-border">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Icon name="AlertCircle" className="size-8" />
                                </EmptyMedia>
                                <EmptyTitle>{t('permissions.noAccess')}</EmptyTitle>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <>
                            <View className="mb-3 flex-row gap-2">
                                <Chip label={t('analytics.range7d')} isSelected={range === 7} onPress={() => setRange(7)} />
                                <Chip label={t('analytics.range30d')} isSelected={range === 30} onPress={() => setRange(30)} />
                                <Chip label={t('analytics.range90d')} isSelected={range === 90} onPress={() => setRange(90)} />
                            </View>

                            <Text className="text-muted-foreground mb-4 text-sm">
                                {t('analytics.rangeLabel', { start: startDate, end: endDate })}
                            </Text>

                            {isLoading ? (
                                <>
                                    <View className="mb-4 w-full flex-row gap-4">
                                        <Skeleton className="h-28 flex-1 rounded-2xl" />
                                        <Skeleton className="h-28 flex-1 rounded-2xl" />
                                    </View>

                                    <Skeleton className="border-border bg-background h-96 rounded-2xl border shadow-2xl" />

                                    <View className="mt-4 mb-4 w-full flex-row gap-4">
                                        <Skeleton className="h-28 flex-1 rounded-2xl" />
                                        <Skeleton className="h-28 flex-1 rounded-2xl" />
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View className="mb-1 flex-row gap-3">
                                        <StatCard title={t('analytics.cards.bookings')} value={bookingTotal} icon="ClipboardCheck" />
                                        <StatCard title={t('analytics.cards.services')} value={servicesTotal} icon="Package" />
                                    </View>

                                    <View className="mb-1 flex-row gap-3">
                                        <StatCard title={t('analytics.cards.checkouts')} value={checkoutsTotal} icon="CreditCard" />
                                        <StatCard
                                            title={t('analytics.cards.checkoutViews')}
                                            value={checkoutViews}
                                            icon="ChartNoAxesCombined"
                                        />
                                    </View>

                                    <View className="mb-1 flex-row gap-3">
                                        <StatCard
                                            title={t('analytics.cards.checkoutUniqueSessions')}
                                            value={checkoutUniqueSessions}
                                            icon="Users"
                                        />
                                        <StatCard
                                            title={t('analytics.cards.requiresAction')}
                                            value={requiresActionCount}
                                            icon="AlertCircle"
                                        />
                                    </View>

                                    <View className="mb-6 flex-row gap-3">
                                        <StatCard title={t('analytics.cards.confirmed')} value={confirmedCount} icon="CheckCircle2" />
                                        <StatCard title={t('analytics.cards.charged')} value={chargedCount} icon="Wallet" />
                                    </View>

                                    <View className="dark:bg-card/40 bg-accent/40 border-border rounded-2xl border p-4">
                                        <Text className="mb-3 text-lg font-semibold">{t('analytics.checkoutViewsByDay')}</Text>

                                        {checkoutDaily.length === 0 ? (
                                            <Text className="text-muted-foreground text-sm">{t('analytics.noCheckoutViews')}</Text>
                                        ) : (
                                            checkoutDaily.map((row) => (
                                                <View
                                                    key={row.date}
                                                    className="border-border flex-row items-center justify-between border-b py-2"
                                                >
                                                    <Text className="text-sm">{row.date}</Text>
                                                    <View className="items-end">
                                                        <Text className="text-sm font-medium">
                                                            {t('analytics.viewsAndSessions', {
                                                                views: row.views,
                                                                sessions: row.uniqueSessions,
                                                            })}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ))
                                        )}
                                    </View>
                                </>
                            )}
                        </>
                    )}
                </AnimatedView>
            </ThemedScroller>
        </View>
    );
}
