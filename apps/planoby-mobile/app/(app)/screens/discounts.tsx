import { Button } from '@kit/native-ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/native-ui/empty';
import { Icon } from '@kit/native-ui/icon';
import { Header } from '@kit/native-ui/layout/header';
import { TouchableOpacity } from '@kit/native-ui/react-native';
import { Skeleton } from '@kit/native-ui/skeleton';
import { Text } from '@kit/native-ui/text';
import { useOrganization } from '@kit/organization/shared';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import AnimatedView from '~/components/animated-view';
import { clientTrpc } from '~/utils/trpc-client';

type DiscountListResponse = Awaited<ReturnType<typeof clientTrpc.organizationDiscountCodeList.fetch>>;

function amountLabel(discount: any) {
    if (discount.type === 'percentage') {
        return `${discount.percentageAmount ?? 0}%`;
    }

    return `${discount.fixedAmount ?? 0}`;
}

export default function DiscountsScreen() {
    const { t } = useTranslation('common');
    const { organization, permissions } = useOrganization();

    const canRead = permissions.includes('booking.select') || permissions.includes('service.select');
    const canCreate = permissions.includes('booking.update') || permissions.includes('service.update');

    const discountsQuery = useQuery({
        queryKey: ['organization-discount-codes', organization.id],
        queryFn: async (): Promise<DiscountListResponse> => {
            const response = await clientTrpc.organizationDiscountCodeList.fetch({ orgId: organization.id });
            return await response;
        },
        enabled: canRead,
    });

    if (canRead === false) {
        return (
            <View className="bg-background flex-1">
                <Header showBackButton title={t('discounts.title')} />
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

    if (discountsQuery.isPending) {
        return (
            <View className="bg-background flex-1">
                <Header showBackButton title={t('discounts.title')} />
                <View className="px-4 pt-4">
                    <Skeleton className="mb-3 h-20 w-full rounded-2xl" />
                    <Skeleton className="mb-3 h-20 w-full rounded-2xl" />
                    <Skeleton className="mb-3 h-20 w-full rounded-2xl" />
                </View>
            </View>
        );
    }

    const discounts = discountsQuery.data?.data ?? [];

    return (
        <View className="bg-background flex-1">
            <AnimatedView animation="scaleIn">
                <Header
                    showBackButton
                    title={t('discounts.title')}
                    rightComponents={
                        canCreate
                            ? [
                                  <Link key="new-discount" href="/screens/discount-single?isNew=true" asChild>
                                      <TouchableOpacity>
                                          <Icon name="Plus" size={24} />
                                      </TouchableOpacity>
                                  </Link>,
                              ]
                            : undefined
                    }
                />

                {discounts.length === 0 ? (
                    <View className="px-4">
                        {canCreate ? (
                            <Link href="/screens/discount-single?isNew=true">
                                <Button className="mb-6">
                                    <Icon name="Plus" size={16} />
                                    <Text>{t('discounts.new')}</Text>
                                </Button>
                            </Link>
                        ) : null}

                        <Empty className="flex-1">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Icon name="Tag" className="size-6" />
                                </EmptyMedia>
                                <EmptyTitle>{t('discounts.empty')}</EmptyTitle>
                            </EmptyHeader>
                        </Empty>
                    </View>
                ) : (
                    <FlatList
                        data={discounts}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Link href={`/screens/discount-single?id=${item.id}`} asChild>
                                <TouchableOpacity activeOpacity={0.85}>
                                    <View className="dark:bg-card/40 bg-accent/40 border-border mx-4 mb-3 rounded-2xl border p-4">
                                        <View className="mb-2 flex-row items-center justify-between">
                                            <Text className="text-base font-semibold">{item.name}</Text>
                                            <Text className={`text-xs font-medium ${item.active ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                {item.active ? t('discounts.active') : t('discounts.archived')}
                                            </Text>
                                        </View>
                                        <Text className="text-muted-foreground text-sm">{item.code ?? t('discounts.noCode')}</Text>
                                        <View className="mt-2 flex-row items-center justify-between">
                                            <Text className="text-sm">{amountLabel(item)}</Text>
                                            <Icon name="ChevronRight" size={16} className="opacity-60" />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Link>
                        )}
                        contentContainerStyle={{ paddingBottom: 80 }}
                    />
                )}
            </AnimatedView>
        </View>
    );
}
