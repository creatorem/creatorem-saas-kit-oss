import { Button } from '@kit/native-ui/button';
import { Icon } from '@kit/native-ui/icon';
import { Skeleton } from '@kit/native-ui/skeleton';
import { Text } from '@kit/native-ui/text';
import { useOrganization } from '@kit/organization/shared';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { clientTrpc } from '~/utils/trpc-client';

type DiscountListResponse = Awaited<ReturnType<typeof clientTrpc.organizationDiscountCodeList.fetch>>;

const amountLabel = (discount: DiscountListResponse['data'][number]) => {
    if (discount.type === 'percentage') {
        return `${discount.percentageAmount ?? 0}%`;
    }

    return `${discount.fixedAmount ?? 0}`;
};

export function OrganizationDiscountsSetting() {
    const { t } = useTranslation('settings');
    const { organization, permissions } = useOrganization();

    const canRead = permissions.includes('booking.select') || permissions.includes('service.select');
    const canCreate = permissions.includes('booking.update') || permissions.includes('service.update');

    const discountsQuery = useQuery({
        queryKey: ['settings-discount-codes', organization.id],
        queryFn: async (): Promise<DiscountListResponse> => {
            const response = await clientTrpc.organizationDiscountCodeList.fetch({ orgId: organization.id });
            return await response;
        },
        enabled: canRead,
    });

    if (!canRead) {
        return (
            <View className="rounded-lg border border-border p-4">
                <Text className="text-base font-semibold">{t('company.discounts.pageTitle')}</Text>
                <Text className="text-muted-foreground mt-1 text-sm">{t('permissions.noAccess')}</Text>
            </View>
        );
    }

    if (discountsQuery.isPending) {
        return (
            <View className="gap-2 rounded-lg border border-border p-4">
                <Text className="text-base font-semibold">{t('company.discounts.pageTitle')}</Text>
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
            </View>
        );
    }

    const discounts = discountsQuery.data?.data ?? [];
    const previewDiscounts = discounts.slice(0, 3);

    return (
        <View className="gap-3 rounded-lg border border-border p-4">
            <Text className="text-base font-semibold">{t('company.discounts.pageTitle')}</Text>
            <Text className="text-muted-foreground text-sm">{t('company.discounts.pageDescription')}</Text>

            {previewDiscounts.length === 0 ? (
                <View className="rounded-xl border border-dashed border-border p-3">
                    <Text className="text-muted-foreground text-sm">{t('common.empty')}</Text>
                </View>
            ) : (
                <View className="gap-2">
                    {previewDiscounts.map((discount) => (
                        <View key={discount.id} className="rounded-xl border border-border p-3">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm font-semibold">{discount.name}</Text>
                                <Text className={`text-xs ${discount.active ? 'text-green-600' : 'text-muted-foreground'}`}>
                                    {discount.active ? t('common.active') : t('common.inactive')}
                                </Text>
                            </View>
                            <Text className="text-muted-foreground mt-1 text-xs">
                                {discount.code ?? t('company.discounts.form.code.placeholder')}
                            </Text>
                            <Text className="text-muted-foreground mt-1 text-xs">{amountLabel(discount)}</Text>
                        </View>
                    ))}
                </View>
            )}

            <View className="flex-row gap-2">
                {canCreate ? (
                    <Link href="/screens/discount-single?isNew=true" asChild>
                        <Button variant="outline" className="flex-1">
                            <Icon name="Plus" size={16} />
                            <Text>{t('company.discounts.new')}</Text>
                        </Button>
                    </Link>
                ) : null}

                <Link href="/screens/discounts" asChild>
                    <Button className="flex-1">
                        <Text>{t('common.viewAll')}</Text>
                    </Button>
                </Link>
            </View>
        </View>
    );
}
