import {
    ActionSheetSelect,
    ActionSheetSelectContent,
    ActionSheetSelectItem,
    ActionSheetSelectTrigger,
    ActionSheetSelectValue,
} from '@kit/native-ui/action-sheet-select';
import { Button } from '@kit/native-ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/native-ui/form';
import { Header } from '@kit/native-ui/layout/header';
import { Skeleton } from '@kit/native-ui/skeleton';
import { toast } from '@kit/native-ui/sonner';
import { Text } from '@kit/native-ui/text';
import { Textarea } from '@kit/native-ui/textarea';
import { Input } from '@kit/native-ui/input';
import { useOrganization } from '@kit/organization/shared';
import { useZodForm } from '@kit/utils/hooks/use-zod-form';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import z from 'zod';
import { Icon } from '@kit/native-ui/icon';
import { clientTrpc } from '~/utils/trpc-client';

const BOOKING_STATES = [
    'requires_slot_confirmation',
    'requires_payment_method',
    'confirmed',
    'charged',
    'canceled',
    'confirmation_failed',
    'partially_refunded',
    'refunded',
] as const;
type SingleBookingResponse = Awaited<ReturnType<typeof clientTrpc.singleBooking.fetch>>;
type ArchiveServicesResponse = Awaited<ReturnType<typeof clientTrpc.archiveServices.fetch>>;
type ServiceOption = ArchiveServicesResponse['servicesData'][number];

const labelFromState = (value: string) =>
    value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (match) => match.toUpperCase());

const emptyToUndefined = (value: string | undefined) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
};

export default function BookingSingleScreen() {
    const { t } = useTranslation('common');
    const { id, isNew } = useLocalSearchParams<{ id?: string; isNew?: string }>();
    const { organization, permissions } = useOrganization();

    const canCreate = permissions.includes('booking.insert');
    const canUpdate = permissions.includes('booking.update');

    const creating = isNew === 'true';

    const bookingQuery = useQuery({
        queryKey: ['single-booking', id],
        queryFn: async (): Promise<SingleBookingResponse> => {
            const response = await clientTrpc.singleBooking.fetch({ id: id as string });
            return await response;
        },
        enabled: typeof id === 'string' && creating === false,
    });

    const servicesQuery = useQuery({
        queryKey: ['booking-editor-services', organization.id],
        queryFn: async (): Promise<ArchiveServicesResponse> => {
            const response = await clientTrpc.archiveServices.fetch({ orgId: organization.id, page: 1, pageSize: 200 });
            return await response;
        },
    });

    const bookingEntity = bookingQuery.data?.booking ?? null;

    const methods = useZodForm({
        schema: z.object({
            firstname: z.string().min(1),
            lastname: z.string().optional(),
            email: z.string().email().optional().or(z.literal('')),
            phone: z.string().optional(),
            serviceId: z.string().optional().or(z.literal('')),
            state: z.string().optional(),
            note: z.string().optional(),
            customerNote: z.string().optional(),
        }),
        defaultValues: {
            firstname: bookingEntity?.firstname ?? '',
            lastname: bookingEntity?.lastname ?? '',
            email: bookingEntity?.email ?? '',
            phone: bookingEntity?.phone ?? '',
            serviceId: bookingEntity?.serviceId ?? '',
            state: bookingEntity?.state ?? 'requires_slot_confirmation',
            note: bookingEntity?.note ?? '',
            customerNote: bookingEntity?.customerNote ?? '',
        },
        mode: 'onSubmit',
    });

    const [isEditing, setIsEditing] = useState<boolean>(creating);
    const [isPending, startTransition] = useTransition();

    const serviceOptions = useMemo<ServiceOption[]>(() => {
        return servicesQuery.data?.servicesData ?? [];
    }, [servicesQuery.data?.servicesData]);
    const serviceLabels = useMemo<Record<string, React.ReactNode>>(() => {
        return {
            '': t('filters.none'),
            ...Object.fromEntries(serviceOptions.map((service) => [service.id, service.name])),
        };
    }, [serviceOptions, t]);
    const bookingStateLabels = useMemo<Record<string, React.ReactNode>>(() => {
        return Object.fromEntries(BOOKING_STATES.map((state) => [state, labelFromState(state)]));
    }, []);

    useEffect(() => {
        if (bookingEntity == null) return;

        methods.reset({
            firstname: bookingEntity.firstname ?? '',
            lastname: bookingEntity.lastname ?? '',
            email: bookingEntity.email ?? '',
            phone: bookingEntity.phone ?? '',
            serviceId: bookingEntity.serviceId ?? '',
            state: bookingEntity.state ?? 'requires_slot_confirmation',
            note: bookingEntity.note ?? '',
            customerNote: bookingEntity.customerNote ?? '',
        });
    }, [bookingEntity, methods]);

    if (creating && canCreate === false) {
        return (
            <View className="bg-background flex-1">
                <Header showBackButton title={t('bookings.title')} />
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
                <Header showBackButton title={t('bookings.title')} />
                <View className="flex-1 items-center justify-center px-6">
                    <Icon name="FileX" size={64} className="text-muted-foreground mb-4" />
                    <Text className="mb-2 text-2xl font-bold">{t('bookings.notFound')}</Text>
                </View>
            </View>
        );
    }

    if (creating === false && bookingQuery.isPending) {
        return (
            <View className="bg-background flex-1">
                <Header showBackButton title={t('bookings.title')} />
                <View className="px-4 pt-4">
                    <Skeleton className="mb-3 h-12 w-full rounded-xl" />
                    <Skeleton className="mb-3 h-12 w-full rounded-xl" />
                    <Skeleton className="mb-3 h-12 w-full rounded-xl" />
                    <Skeleton className="mb-3 h-28 w-full rounded-xl" />
                </View>
            </View>
        );
    }

    if (creating === false && bookingEntity == null) {
        return (
            <View className="bg-background flex-1">
                <Header showBackButton title={t('bookings.title')} />
                <View className="flex-1 items-center justify-center px-6">
                    <Icon name="FileX" size={64} className="text-muted-foreground mb-4" />
                    <Text className="mb-2 text-2xl font-bold">{t('bookings.notFound')}</Text>
                    <Text className="text-muted-foreground text-center">{t('bookings.notFoundDescription')}</Text>
                </View>
            </View>
        );
    }

    const onSubmit = methods.handleSubmit((values) => {
        startTransition(async () => {
            try {
                const payload = {
                    firstname: values.firstname,
                    lastname: emptyToUndefined(values.lastname),
                    email: emptyToUndefined(values.email),
                    phone: emptyToUndefined(values.phone),
                    serviceId: emptyToUndefined(values.serviceId),
                    state: BOOKING_STATES.includes(values.state as any) ? (values.state as any) : undefined,
                    note: emptyToUndefined(values.note),
                    customerNote: emptyToUndefined(values.customerNote),
                };

                if (creating) {
                    const created = await clientTrpc.createBooking.fetch({
                        orgId: organization.id,
                        data: payload,
                    });

                    if (created == null) {
                        throw new Error('Booking create failed');
                    }

                    toast.success(t('bookings.created'));
                    router.replace(`/screens/booking-single?id=${created.id}` as any);
                    return;
                }

                if (canUpdate === false) {
                    toast.error(t('permissions.noAccess'));
                    return;
                }
                if (bookingEntity == null) {
                    toast.error(t('bookings.notFound'));
                    return;
                }

                const result = await clientTrpc.updateBooking.fetch({
                    bookingId: bookingEntity.id,
                    data: payload,
                });

                if (result.success) {
                    toast.success(t('bookings.updated'));
                    setIsEditing(false);
                } else {
                    toast.error(result.error ?? t('bookings.updateFailed'));
                }
            } catch (error) {
                toast.error(creating ? t('bookings.createFailed') : t('bookings.updateFailed'));
            }
        });
    });

    const canToggleEdit = creating || canUpdate;

    return (
        <View className="bg-background flex-1">
            <Header
                showBackButton
                title={creating ? t('bookings.new') : t('bookings.details')}
                rightComponents={
                    creating || canToggleEdit === false
                        ? undefined
                        : [
                              <TouchableOpacity key="toggle-edit" onPress={() => setIsEditing((prev) => !prev)}>
                                  <Icon name={isEditing ? 'PencilOff' : 'Edit'} size={24} />
                              </TouchableOpacity>,
                          ]
                }
            />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
                <Form {...methods}>
                    <View className="px-4 py-4">
                        {creating === false && bookingEntity ? (
                            <View className="mb-4 rounded-2xl border border-border p-4">
                                <Text className="text-lg font-semibold">#{bookingEntity.relativeId ?? '-'}</Text>
                                <Text className="text-muted-foreground text-sm">{labelFromState(bookingEntity.state)}</Text>
                            </View>
                        ) : null}

                        <FormField
                            control={methods.control}
                            name="firstname"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>{t('bookings.fields.firstname')}</FormLabel>
                                    <FormControl>
                                        <Input value={field.value} onChangeText={field.onChange} editable={isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={methods.control}
                            name="lastname"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>{t('bookings.fields.lastname')}</FormLabel>
                                    <FormControl>
                                        <Input value={field.value ?? ''} onChangeText={field.onChange} editable={isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={methods.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>{t('bookings.fields.email')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            value={field.value ?? ''}
                                            onChangeText={field.onChange}
                                            editable={isEditing}
                                            keyboardType="email-address"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={methods.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>{t('bookings.fields.phone')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            value={field.value ?? ''}
                                            onChangeText={field.onChange}
                                            editable={isEditing}
                                            keyboardType="phone-pad"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={methods.control}
                            name="serviceId"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>{t('bookings.fields.service')}</FormLabel>
                                    <ActionSheetSelect
                                        labels={serviceLabels}
                                        value={field.value || ''}
                                        onValueChange={isEditing ? field.onChange : undefined}
                                    >
                                        <FormControl>
                                            <ActionSheetSelectTrigger>
                                                <ActionSheetSelectValue placeholder={t('bookings.placeholders.selectService')} />
                                            </ActionSheetSelectTrigger>
                                        </FormControl>
                                        <ActionSheetSelectContent>
                                            <ActionSheetSelectItem value="" />
                                            {serviceOptions.map((service) => (
                                                <ActionSheetSelectItem key={service.id} value={service.id} />
                                            ))}
                                        </ActionSheetSelectContent>
                                    </ActionSheetSelect>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={methods.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>{t('bookings.fields.state')}</FormLabel>
                                    <ActionSheetSelect
                                        labels={bookingStateLabels}
                                        value={field.value || BOOKING_STATES[0]}
                                        onValueChange={isEditing ? field.onChange : undefined}
                                    >
                                        <FormControl>
                                            <ActionSheetSelectTrigger>
                                                <ActionSheetSelectValue placeholder={t('bookings.fields.state')} />
                                            </ActionSheetSelectTrigger>
                                        </FormControl>
                                        <ActionSheetSelectContent>
                                            {BOOKING_STATES.map((state) => (
                                                <ActionSheetSelectItem key={state} value={state} />
                                            ))}
                                        </ActionSheetSelectContent>
                                    </ActionSheetSelect>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={methods.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>{t('bookings.fields.note')}</FormLabel>
                                    <FormControl>
                                        <Textarea value={field.value ?? ''} onChangeText={field.onChange} editable={isEditing} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={methods.control}
                            name="customerNote"
                            render={({ field }) => (
                                <FormItem className="mb-3">
                                    <FormLabel>{t('bookings.fields.customerNote')}</FormLabel>
                                    <FormControl>
                                        <Textarea value={field.value ?? ''} onChangeText={field.onChange} editable={isEditing} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {isEditing ? (
                            <View className="mt-2 flex-row gap-3">
                                <Button className="flex-1" onPress={onSubmit} disabled={isPending}>
                                    <Text>{creating ? t('actions.create') : t('actions.save')}</Text>
                                </Button>
                                {creating ? null : (
                                    <Button variant="outline" className="flex-1" onPress={() => setIsEditing(false)}>
                                        <Text>{t('actions.cancel')}</Text>
                                    </Button>
                                )}
                            </View>
                        ) : null}
                    </View>
                </Form>
            </ScrollView>
        </View>
    );
}
