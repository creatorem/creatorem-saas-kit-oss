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

interface RecentServicesProps {
    services: Array<{
        id: string;
        name: string;
        state: string;
        createdAt: string | Date | null;
    }>;
    isLoading: boolean;
}

const RecentServices: React.FC<RecentServicesProps> = ({ services, isLoading }) => {
    const { t } = useTranslation('common');

    if (isLoading) {
        return (
            <View className="flex gap-3">
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
            </View>
        );
    }

    if (services.length === 0) {
        return (
            <Empty className="flex-1">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Icon name="Package" size={32} />
                    </EmptyMedia>
                    <EmptyTitle>{t('dashboard.emptyServices')}</EmptyTitle>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <View>
            {services.map((service) => (
                <Link key={service.id} href={`/screens/service-single?id=${service.id}`} asChild>
                    <TouchableOpacity activeOpacity={0.8}>
                        <View className="dark:bg-card/40 bg-accent/40 border-border mb-3 rounded-xl border p-4">
                            <View className="mb-1 flex-row items-center justify-between">
                                <Text className="mr-2 flex-1 text-lg font-semibold">{service.name}</Text>
                                <Icon name="ChevronRight" size={16} className="opacity-60" />
                            </View>
                            <View className="mb-2 flex-col gap-1">
                                <View className="flex-row items-center">
                                    <Icon name="Tag" size={12} className="mr-2 opacity-60" />
                                    <Text className="text-sm opacity-60">{service.state}</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center">
                                <Icon name="Calendar" size={12} className="mr-1 opacity-60" />
                                <Text className="text-sm opacity-60">
                                    {String(service.createdAt ?? '').match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? ''}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Link>
            ))}
        </View>
    );
};

export const RecentServicesSection: React.FC = () => {
    const { t } = useTranslation('common');
    const { organization } = useOrganization();
    const { clientTrpc } = useCtxTrpc();

    const { data: servicesData, isPending: servicesLoading } = useInfiniteQuery({
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
    });

    const recentServices = useMemo(() => {
        if (!servicesData?.pages?.[0]) return [];
        return servicesData.pages[0].servicesData.slice(0, 3) as RecentServicesProps['services'];
    }, [servicesData]);

    return (
        <>
            <Section
                titleSize="lg"
                className="mt-10 mb-2"
                title={t('dashboard.recentServices')}
                link="/(app)/(tabs)/services"
                linkText={t('dashboard.viewAll')}
            />
            <RecentServices services={recentServices} isLoading={servicesLoading} />
        </>
    );
};
