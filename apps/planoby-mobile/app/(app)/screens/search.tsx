import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/native-ui/empty';
import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon } from '@kit/native-ui/icon';
import { Header } from '@kit/native-ui/layout/header';
import { Skeleton } from '@kit/native-ui/skeleton';
import { Text } from '@kit/native-ui/text';
import { ThemedScroller } from '@kit/native-ui/themed-scroller';
import { useOrganization } from '@kit/organization/shared';
import { useQueries } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedView from '~/components/animated-view';
import { Chip } from '~/components/chip';
import { clientTrpc } from '~/utils/trpc-client';

type SearchCategory = 'all' | 'bookings' | 'services';

type SearchItem = {
    id: string;
    type: 'booking' | 'service';
    title: string;
    subtitle?: string;
    href: string;
    date?: string;
};

const SEARCH_PAGE_SIZE = 200;
type BookingsArchiveResponse = Awaited<ReturnType<typeof clientTrpc.archiveBookings.fetch>>;
type ServicesArchiveResponse = Awaited<ReturnType<typeof clientTrpc.archiveServices.fetch>>;

const normalizeText = (value: unknown) => String(value ?? '').toLowerCase().trim();

const dateLabel = (value: unknown) => String(value ?? '').match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? '';

export default function SearchScreen() {
    const { t } = useTranslation('common');
    const { organization } = useOrganization();
    const colors = useThemeColors();

    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');

    const results = useQueries({
        queries: [
            {
                queryKey: ['search-bookings', organization.id],
                queryFn: async (): Promise<BookingsArchiveResponse> => {
                    const response = await clientTrpc.archiveBookings.fetch({
                        orgId: organization.id,
                        page: 1,
                        pageSize: SEARCH_PAGE_SIZE,
                    });
                    return await response;
                },
            },
            {
                queryKey: ['search-services', organization.id],
                queryFn: async (): Promise<ServicesArchiveResponse> => {
                    const response = await clientTrpc.archiveServices.fetch({
                        orgId: organization.id,
                        page: 1,
                        pageSize: SEARCH_PAGE_SIZE,
                    });
                    return await response;
                },
            },
        ],
    });

    const [bookingsQuery, servicesQuery] = results;
    const isLoading = results.some((result) => result.isPending);
    const normalizedQuery = normalizeText(query);

    const items = useMemo(() => {
        const base: SearchItem[] = [];
        const bookings = bookingsQuery.data?.bookingsData ?? [];
        const services = servicesQuery.data?.servicesData ?? [];

        for (const booking of bookings) {
            const title = `${booking.firstname} ${booking.lastname ?? ''}`.trim();
            const subtitle = booking.serviceName ?? booking.state;
            const searchable = normalizeText(`${title} ${subtitle} ${booking.email} ${booking.phone} ${booking.relativeId}`);
            if (normalizedQuery && !searchable.includes(normalizedQuery)) continue;
            if (selectedCategory !== 'all' && selectedCategory !== 'bookings') continue;

            base.push({
                id: booking.id,
                type: 'booking',
                title,
                subtitle,
                href: `/screens/booking-single?id=${booking.id}`,
                date: dateLabel(booking.createdAt),
            });
        }

        for (const service of services) {
            const title = service.name;
            const subtitle = service.description ?? service.state;
            const searchable = normalizeText(`${title} ${subtitle} ${service.relativeId}`);
            if (normalizedQuery && !searchable.includes(normalizedQuery)) continue;
            if (selectedCategory !== 'all' && selectedCategory !== 'services') continue;

            base.push({
                id: service.id,
                type: 'service',
                title,
                subtitle,
                href: `/screens/service-single?id=${service.id}`,
                date: dateLabel(service.createdAt),
            });
        }

        return base.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
    }, [
        bookingsQuery.data?.bookingsData,
        normalizedQuery,
        selectedCategory,
        servicesQuery.data?.servicesData,
    ]);

    const showQuickActions = normalizedQuery.length === 0;

    return (
        <View className="bg-background flex-1">
            <AnimatedView animation="scaleIn">
                <Header />

                <View className="flex-1">
                    <View className="w-full flex-row items-center px-4">
                        <TouchableOpacity onPress={() => router.back()} className="relative z-50 mr-2 py-4">
                            <Icon name="ArrowLeft" size={24} color={colors['--color-foreground']} />
                        </TouchableOpacity>
                        <View className="relative flex-1">
                            <Icon name="Search" className="pointer-events-none absolute top-3 left-3 z-50" size={20} />
                            <TextInput
                                className="bg-background elevation-lg border-border text-foreground relative w-full flex-row items-center rounded-full border px-10 py-3 dark:bg-white/20"
                                onChangeText={setQuery}
                                value={query}
                            />
                        </View>
                    </View>

                    <View className="px-4 pb-3">
                        <FlatList
                            data={[
                                { id: 'all', label: t('filters.all') },
                                { id: 'bookings', label: t('tabs.bookings') },
                                { id: 'services', label: t('tabs.services') },
                            ]}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <View className="mr-2">
                                    <Chip
                                        label={item.label}
                                        isSelected={selectedCategory === item.id}
                                        onPress={() => setSelectedCategory(item.id as SearchCategory)}
                                    />
                                </View>
                            )}
                        />
                    </View>

                    {isLoading ? (
                        <View className="mt-4 px-4">
                            <View className="flex gap-2">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <Skeleton key={index} className="h-20 w-full rounded-lg" />
                                ))}
                            </View>
                        </View>
                    ) : showQuickActions ? (
                        <ThemedScroller>
                            <View className="mt-4 px-4">
                                <Text className="text-md text-muted-foreground mb-3 ml-1 font-semibold">{t('search.quickActions')}</Text>
                                <View className="flex gap-2">
                                    <TouchableOpacity
                                        className="dark:bg-card/40 bg-accent/40 border-border flex-row items-center rounded-xl border p-4"
                                        onPress={() => router.push('/(app)/(tabs)/bookings')}
                                    >
                                        <Icon name="ClipboardCheck" size={20} className="mr-3" />
                                        <Text className="font-medium">{t('tabs.bookings')}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="dark:bg-card/40 bg-accent/40 border-border flex-row items-center rounded-xl border p-4"
                                        onPress={() => router.push('/(app)/(tabs)/services')}
                                    >
                                        <Icon name="Package" size={20} className="mr-3" />
                                        <Text className="font-medium">{t('tabs.services')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ThemedScroller>
                    ) : items.length === 0 ? (
                        <View className="flex-1 items-center justify-center px-2">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Icon name="Search" className="size-8" />
                                    </EmptyMedia>
                                    <EmptyTitle>{t('search.noResults')}</EmptyTitle>
                                </EmptyHeader>
                            </Empty>
                        </View>
                    ) : (
                        <View className="px-4">
                            <View className="mb-2">
                                <Text className="text-sm opacity-60">{t('search.results', { count: items.length })}</Text>
                            </View>
                            <FlatList
                                data={items}
                                keyExtractor={(item) => `${item.type}-${item.id}`}
                                renderItem={({ item }) => (
                                    <Link href={item.href as any} asChild>
                                        <TouchableOpacity activeOpacity={0.8}>
                                            <View className="dark:bg-card/40 bg-accent/40 border-border mb-3 flex-row items-center rounded-xl border p-4">
                                                <View className="bg-muted mr-3 h-10 w-10 items-center justify-center rounded-lg">
                                                    <Icon
                                                        name={
                                                            item.type === 'booking'
                                                                ? 'ClipboardCheck'
                                                                : 'Package'
                                                        }
                                                        size={18}
                                                    />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-base font-semibold" numberOfLines={1}>
                                                        {item.title}
                                                    </Text>
                                                    {item.subtitle ? (
                                                        <Text className="text-muted-foreground text-sm" numberOfLines={1}>
                                                            {item.subtitle}
                                                        </Text>
                                                    ) : null}
                                                </View>
                                                <Icon name="ChevronRight" size={16} className="opacity-60" />
                                            </View>
                                        </TouchableOpacity>
                                    </Link>
                                )}
                                contentContainerStyle={{ paddingBottom: 100 }}
                            />
                        </View>
                    )}
                </View>
            </AnimatedView>
        </View>
    );
}
