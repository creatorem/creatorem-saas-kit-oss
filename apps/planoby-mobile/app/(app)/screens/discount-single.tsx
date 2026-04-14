import {
    ActionSheetSelect,
    ActionSheetSelectContent,
    ActionSheetSelectItem,
    ActionSheetSelectTrigger,
    ActionSheetSelectValue,
} from '@kit/native-ui/action-sheet-select';
import { Button } from '@kit/native-ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/native-ui/form';
import { Icon } from '@kit/native-ui/icon';
import { Input } from '@kit/native-ui/input';
import { Header } from '@kit/native-ui/layout/header';
import { Skeleton } from '@kit/native-ui/skeleton';
import { toast } from '@kit/native-ui/sonner';
import { Text } from '@kit/native-ui/text';
import { useOrganization } from '@kit/organization/shared';
import { useZodForm } from '@kit/utils/hooks/use-zod-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import z from 'zod';
import { Chip } from '~/components/chip';
import { clientTrpc } from '~/utils/trpc-client';

const DISCOUNT_TYPES = ['percentage', 'fixed'] as const;
type DiscountType = (typeof DISCOUNT_TYPES)[number];
type DiscountListResponse = Awaited<ReturnType<typeof clientTrpc.organizationDiscountCodeList.fetch>>;
type ArchiveServicesResponse = Awaited<ReturnType<typeof clientTrpc.archiveServices.fetch>>;
type ServiceOption = ArchiveServicesResponse['servicesData'][number];

const emptyToUndefined = (value: string | undefined) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
};

const emptyToNullableInt = (value: string | undefined) => {
    const parsed = Number(value ?? '');
    if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
    }
    return null;
};

const emptyToNullableNumber = (value: string | undefined) => {
    const parsed = Number(value ?? '');
    if (Number.isFinite(parsed) && parsed >= 0) {
        return parsed;
    }
    return null;
};

export default function DiscountSingleScreen() {
    const { t } = useTranslation('common');
    const { id, isNew } = useLocalSearchParams<{ id?: string; isNew?: string }>();
    const { organization, permissions } = useOrganization();
    const queryClient = useQueryClient();

    const canRead = permissions.includes('booking.select') || permissions.includes('service.select');
    const canWrite = permissions.includes('booking.update') || permissions.includes('service.update');
    const creating = isNew === 'true';

    const discountsQuery = useQuery({
        queryKey: ['organization-discount-codes', organization.id],
        queryFn: async (): Promise<DiscountListResponse> => {
            const response = await clientTrpc.organizationDiscountCodeList.fetch({ orgId: organization.id });
            return await response;
        },
        enabled: canRead,
    });

    const servicesQuery = useQuery({
        queryKey: ['discount-editor-services', organization.id],
        queryFn: async (): Promise<ArchiveServicesResponse> => {
            const response = await clientTrpc.archiveServices.fetch({ orgId: organization.id, page: 1, pageSize: 200 });
            return await response;
        },
        enabled: canRead,
    });

    const discountEntity = useMemo(
        () => discountsQuery.data?.data.find((discount: DiscountListResponse['data'][number]) => discount.id === id) ?? null,
        [discountsQuery.data?.data, id],
    );
    const discountTypeLabels = useMemo<Record<string, React.ReactNode>>(() => {
        return {
            percentage: t('discounts.type.percentage'),
            fixed: t('discounts.type.fixed'),
        };
    }, [t]);

    const methods = useZodForm({
        schema: z.object({
            name: z.string().min(1),
            code: z.string().optional(),
            type: z.enum(DISCOUNT_TYPES),
            percentageAmount: z.string().optional(),
            fixedAmount: z.string().optional(),
            expiresOn: z.string().optional(),
            maxTotalUses: z.string().optional(),
        }),
        defaultValues: {
            name: discountEntity?.name ?? '',
            code: discountEntity?.code ?? '',
            type: ((discountEntity?.type as DiscountType | undefined) ?? 'percentage') as DiscountType,
            percentageAmount: discountEntity?.percentageAmount == null ? '' : String(discountEntity.percentageAmount),
            fixedAmount: discountEntity?.fixedAmount == null ? '' : String(discountEntity.fixedAmount),
            expiresOn: discountEntity?.expiresOn ?? '',
            maxTotalUses: discountEntity?.maxTotalUses == null ? '' : String(discountEntity.maxTotalUses),
        },
        mode: 'onSubmit',
    });

    const [limitPerEmail, setLimitPerEmail] = useState<boolean>(discountEntity?.limitPerEmail ?? false);
    const [active, setActive] = useState<boolean>(discountEntity?.active ?? true);
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(discountEntity?.serviceIds ?? []);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (discountEntity == null) return;

        methods.reset({
            name: discountEntity.name ?? '',
            code: discountEntity.code ?? '',
            type: ((discountEntity.type as DiscountType | undefined) ?? 'percentage') as DiscountType,
            percentageAmount: discountEntity.percentageAmount == null ? '' : String(discountEntity.percentageAmount),
            fixedAmount: discountEntity.fixedAmount == null ? '' : String(discountEntity.fixedAmount),
            expiresOn: discountEntity.expiresOn ?? '',
            maxTotalUses: discountEntity.maxTotalUses == null ? '' : String(discountEntity.maxTotalUses),
        });

        setLimitPerEmail(Boolean(discountEntity.limitPerEmail));
        setActive(Boolean(discountEntity.active));
        setSelectedServiceIds(discountEntity.serviceIds ?? []);
    }, [discountEntity, methods]);

    if (canRead === false) {
        return (
            <View className="bg-background flex-1">
                <Header showBackButton title={t('discounts.title')} />
                <View className="flex-1 items-center justify-center px-6">
                    <Icon name="AlertCircle" size={64} className="text-muted-foreground mb-4" />
                    <Text className="mb-2 text-2xl font-bold">{t('permissions.noAccess')}</Text>
                </View>
            </View>
        );
    }

    if (creating === false && typeof id !== 'string') {
        return (
            <View className="bg-background flex-1">
                <Header showBackButton title={t('discounts.title')} />
                <View className="flex-1 items-center justify-center px-6">
                    <Icon name="FileX" size={64} className="text-muted-foreground mb-4" />
                    <Text className="mb-2 text-2xl font-bold">{t('discounts.notFound')}</Text>
                </View>
            </View>
        );
    }

    if (discountsQuery.isPending || servicesQuery.isPending) {
        return (
            <View className="bg-background flex-1">
                <Header showBackButton title={t('discounts.title')} />
                <View className="px-4 pt-4">
                    <Skeleton className="mb-3 h-12 w-full rounded-xl" />
                    <Skeleton className="mb-3 h-12 w-full rounded-xl" />
                    <Skeleton className="mb-3 h-12 w-full rounded-xl" />
                    <Skeleton className="mb-3 h-28 w-full rounded-xl" />
                </View>
            </View>
        );
    }

    if (creating === false && discountEntity == null) {
        return (
            <View className="bg-background flex-1">
                <Header showBackButton title={t('discounts.title')} />
                <View className="flex-1 items-center justify-center px-6">
                    <Icon name="FileX" size={64} className="text-muted-foreground mb-4" />
                    <Text className="mb-2 text-2xl font-bold">{t('discounts.notFound')}</Text>
                    <Text className="text-muted-foreground text-center">{t('discounts.notFoundDescription')}</Text>
                </View>
            </View>
        );
    }

    const services: ServiceOption[] = servicesQuery.data?.servicesData ?? [];

    const onSubmit = methods.handleSubmit((values) => {
        if (canWrite === false) {
            toast.error(t('permissions.noAccess'));
            return;
        }

        startTransition(async () => {
            try {
                const type = values.type as DiscountType;
                const percentageAmount = type === 'percentage' ? emptyToNullableNumber(values.percentageAmount) : null;
                const fixedAmount = type === 'fixed' ? emptyToNullableNumber(values.fixedAmount) : null;

                if (type === 'percentage' && (percentageAmount == null || percentageAmount > 100)) {
                    toast.error(t('discounts.validation.percentage'));
                    return;
                }

                if (type === 'fixed' && fixedAmount == null) {
                    toast.error(t('discounts.validation.fixed'));
                    return;
                }

                const payload = {
                    name: values.name,
                    code: emptyToUndefined(values.code) ?? null,
                    type,
                    percentageAmount,
                    fixedAmount,
                    expiresOn: emptyToUndefined(values.expiresOn) ?? null,
                    maxTotalUses: emptyToNullableInt(values.maxTotalUses),
                    limitPerEmail,
                    active,
                    serviceIds: selectedServiceIds,
                };

                if (creating) {
                    await clientTrpc.organizationDiscountCodeCreate.fetch({
                        orgId: organization.id,
                        ...payload,
                    });
                    toast.success(t('discounts.created'));
                } else {
                    if (discountEntity == null) {
                        toast.error(t('discounts.notFound'));
                        return;
                    }
                    await clientTrpc.organizationDiscountCodeUpdate.fetch({
                        orgId: organization.id,
                        discountCodeId: discountEntity.id,
                        ...payload,
                    });
                    toast.success(t('discounts.updated'));
                }

                await queryClient.invalidateQueries({
                    queryKey: ['organization-discount-codes', organization.id],
                });
                router.replace('/screens/discounts');
            } catch (_error) {
                toast.error(creating ? t('discounts.createFailed') : t('discounts.updateFailed'));
            }
        });
    });

    const archiveCurrentDiscount = async () => {
        if (creating || discountEntity == null || canWrite === false) return;

        startTransition(async () => {
            try {
                await clientTrpc.organizationDiscountCodeArchive.fetch({
                    orgId: organization.id,
                    discountCodeId: discountEntity.id,
                });
                await queryClient.invalidateQueries({
                    queryKey: ['organization-discount-codes', organization.id],
                });
                toast.success(t('discounts.archivedToast'));
                router.replace('/screens/discounts');
            } catch (_error) {
                toast.error(t('discounts.archiveFailed'));
            }
        });
    };

    return (
        <View className="bg-background flex-1">
            <Header showBackButton title={creating ? t('discounts.new') : t('discounts.details')} />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
                <Form {...methods}>
                    <View className="px-4 py-4">
                        <FormField
                            control={methods.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>{t('discounts.fields.name')}</FormLabel>
                                    <FormControl>
                                        <Input value={field.value} onChangeText={field.onChange} editable={canWrite} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={methods.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>{t('discounts.fields.code')}</FormLabel>
                                    <FormControl>
                                        <Input value={field.value ?? ''} onChangeText={field.onChange} editable={canWrite} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={methods.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>{t('discounts.fields.type')}</FormLabel>
                                    <ActionSheetSelect
                                        labels={discountTypeLabels}
                                        value={field.value}
                                        onValueChange={canWrite ? field.onChange : undefined}
                                    >
                                        <FormControl>
                                            <ActionSheetSelectTrigger>
                                                <ActionSheetSelectValue placeholder={t('discounts.fields.type')} />
                                            </ActionSheetSelectTrigger>
                                        </FormControl>
                                        <ActionSheetSelectContent>
                                            <ActionSheetSelectItem value="percentage" />
                                            <ActionSheetSelectItem value="fixed" />
                                        </ActionSheetSelectContent>
                                    </ActionSheetSelect>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={methods.control}
                            name="percentageAmount"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>{t('discounts.fields.percentageAmount')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            value={field.value ?? ''}
                                            onChangeText={field.onChange}
                                            editable={canWrite}
                                            keyboardType="numeric"
                                            placeholder="0-100"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={methods.control}
                            name="fixedAmount"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>{t('discounts.fields.fixedAmount')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            value={field.value ?? ''}
                                            onChangeText={field.onChange}
                                            editable={canWrite}
                                            keyboardType="numeric"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={methods.control}
                            name="expiresOn"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>{t('discounts.fields.expiresOn')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            value={field.value ?? ''}
                                            onChangeText={field.onChange}
                                            editable={canWrite}
                                            placeholder="YYYY-MM-DD"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={methods.control}
                            name="maxTotalUses"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>{t('discounts.fields.maxTotalUses')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            value={field.value ?? ''}
                                            onChangeText={field.onChange}
                                            editable={canWrite}
                                            keyboardType="numeric"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <View className="mb-3">
                            <Text className="mb-2 text-sm font-medium">{t('discounts.fields.options')}</Text>
                            <View className="flex-row gap-2">
                                <Chip
                                    label={t('discounts.fields.limitPerEmail')}
                                    isSelected={limitPerEmail}
                                    onPress={() => canWrite && setLimitPerEmail((previous) => !previous)}
                                />
                                <Chip
                                    label={active ? t('discounts.active') : t('discounts.archived')}
                                    isSelected={active}
                                    onPress={() => canWrite && setActive((previous) => !previous)}
                                />
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-medium">{t('discounts.fields.services')}</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {services.map((service) => (
                                    <Chip
                                        key={service.id}
                                        label={service.name}
                                        isSelected={selectedServiceIds.includes(service.id)}
                                        onPress={() => {
                                            if (canWrite === false) return;
                                            setSelectedServiceIds((previous) =>
                                                previous.includes(service.id)
                                                    ? previous.filter((serviceId) => serviceId !== service.id)
                                                    : [...previous, service.id],
                                            );
                                        }}
                                    />
                                ))}
                            </View>
                        </View>

                        <View className="mt-2 flex-row gap-3">
                            <Button className="flex-1" onPress={onSubmit} disabled={isPending || canWrite === false}>
                                <Text>{creating ? t('actions.create') : t('actions.save')}</Text>
                            </Button>
                            <Button variant="outline" className="flex-1" onPress={() => router.replace('/screens/discounts')}>
                                <Text>{t('actions.cancel')}</Text>
                            </Button>
                        </View>

                        {creating ? null : (
                            <Button
                                className="mt-3"
                                variant="destructive"
                                onPress={archiveCurrentDiscount}
                                disabled={isPending || canWrite === false}
                            >
                                <Text>{t('discounts.archiveAction')}</Text>
                            </Button>
                        )}
                    </View>
                </Form>
            </ScrollView>
        </View>
    );
}
