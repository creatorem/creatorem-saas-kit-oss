'use client';

import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { BillingConfig, BillingCustomer } from '@kit/billing-types';
import { Button } from '@kit/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { ScrollArea } from '@kit/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@kit/ui/select';
import { Separator } from '@kit/ui/separator';
// import { useZodForm } from '@kit/utils/hooks/use-zod-form'; @todo remove all of this, wrongly typed
import { Skeleton } from '@kit/ui/skeleton';
import { toast } from '@kit/ui/sonner';
import { useZodForm } from '@kit/utils/hooks/use-zod-form';
import React from 'react';
import { type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { billingRouter } from '../../router/router';
import {
    billingAddressCountries,
    type UpdateBillingCustomerFormSchema,
    updateBillingCustomerSchema,
} from '../../schemas/update-billing-customer.schema';

export type BillingCustomerFormProps = {
    customer: BillingCustomer;
    config: BillingConfig;
    clientTrpc: TrpcClientWithQuery<typeof billingRouter>;
};

export function BillingCustomerForm({ customer, config, clientTrpc }: BillingCustomerFormProps): React.JSX.Element {
    type FormValues = Omit<UpdateBillingCustomerFormSchema, 'revalidateUrl' | 'config'>;

    const { t } = useTranslation('p_billing' as any);

    const methods = useZodForm({
        schema: updateBillingCustomerSchema.omit({ revalidateUrl: true, config: true }),
        mode: 'onSubmit',
        defaultValues: {
            email: customer.email ?? '',
            name: customer.name ?? '',
            line1: customer.address?.line1 ?? '',
            line2: customer.address?.line2 ?? '',
            country: customer.address?.country ?? '',
            postalCode: customer.address?.postalCode ?? '',
            city: customer.address?.city ?? '',
            state: customer.address?.state ?? '',
        },
    });

    const canSubmit = !methods.formState.isSubmitting;
    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        if (!canSubmit) {
            return;
        }

        try {
            await clientTrpc.updateBillingCustomer.fetch({
                ...values,
                revalidateUrl: window.location.href,
                config,
            });
            toast.success(t('customerForm.messages.billingAddressUpdated'));
        } catch {
            toast.error(t('customerForm.messages.updateBillingAddressError'));
        }
    };

    return (
        <Form {...methods}>
            <form className="space-y-4" onSubmit={methods.handleSubmit(onSubmit)}>
                <div className="flex max-w-lg flex-col gap-y-2">
                    <FormField
                        control={methods.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="flex w-full flex-col">
                                <FormLabel>{t('customerForm.labels.name')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        maxLength={512}
                                        disabled={methods.formState.isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex max-w-lg flex-col gap-y-2">
                    <FormField
                        control={methods.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="flex w-full flex-col">
                                <FormLabel>{t('customerForm.labels.emailAddress')}</FormLabel>
                                <div className="flex w-full flex-col gap-0.5">
                                    <FormControl>
                                        <Input
                                            type="email"
                                            maxLength={255}
                                            disabled={methods.formState.isSubmitting}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>{t('customerForm.descriptions.emailAddress')}</FormDescription>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {config.provider === 'stripe' && (
                    <>
                        <div className="flex max-w-lg flex-col gap-y-2">
                            <FormField
                                control={methods.control}
                                name="line1"
                                render={({ field }) => (
                                    <FormItem className="flex w-full flex-col">
                                        <FormLabel>{t('customerForm.labels.addressLine1')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                autoComplete="address-line1"
                                                maxLength={512}
                                                disabled={methods.formState.isSubmitting}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex max-w-lg flex-col gap-y-2">
                            <FormField
                                control={methods.control}
                                name="line2"
                                render={({ field }) => (
                                    <FormItem className="flex w-full flex-col">
                                        <FormLabel>{t('customerForm.labels.addressLine2')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                autoComplete="address-line2"
                                                maxLength={512}
                                                disabled={methods.formState.isSubmitting}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </>
                )}
                <div className="flex max-w-lg flex-col gap-y-2">
                    <FormField
                        control={methods.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem className="flex w-full flex-col">
                                <FormLabel>{t('customerForm.labels.country')}</FormLabel>
                                <FormControl>
                                    <Select
                                        {...field}
                                        value={field.value}
                                        disabled={methods.formState.isSubmitting}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="[&>span]:truncate">
                                            <SelectValue placeholder={t('customerForm.placeholders.selectCountry')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <ScrollArea style={{ maxHeight: '176px' }}>
                                                <SelectItem key="empty" value={null as unknown as string}>
                                                    {t('customerForm.placeholders.selectCountry')}
                                                </SelectItem>
                                                <SelectSeparator />
                                                {billingAddressCountries.map((country) => (
                                                    <SelectItem key={country.code} value={country.code}>
                                                        {country.name}
                                                    </SelectItem>
                                                ))}
                                            </ScrollArea>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex max-w-lg flex-col gap-2 md:flex-row">
                    {config.provider === 'stripe' && (
                        <div className="flex w-full max-w-lg flex-col gap-y-2 md:w-1/3">
                            <FormField
                                control={methods.control}
                                name="postalCode"
                                render={({ field }) => (
                                    <FormItem className="flex w-full flex-col">
                                        <FormLabel>{t('customerForm.labels.postalCode')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                autoComplete="postal-code"
                                                maxLength={12}
                                                disabled={methods.formState.isSubmitting}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                    <div className="flex max-w-lg flex-1 flex-col gap-y-2">
                        <FormField
                            control={methods.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem className="flex w-full flex-col">
                                    <FormLabel>{t('customerForm.labels.city')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            autoComplete="address-level2"
                                            maxLength={512}
                                            disabled={methods.formState.isSubmitting}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <div className="flex max-w-lg flex-col gap-y-2">
                    <FormField
                        control={methods.control}
                        name="state"
                        render={({ field }) => (
                            <FormItem className="flex w-full flex-col">
                                <FormLabel>{t('customerForm.labels.state')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        autoComplete="address-level1"
                                        maxLength={512}
                                        disabled={methods.formState.isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        variant="default"
                        size="default"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!canSubmit}
                        loading={methods.formState.isSubmitting}
                        aria-label={t('customerForm.buttons.saveBillingAddressAriaLabel')}
                    >
                        {t('customerForm.buttons.saveBillingProfile')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

// skeleton version
export function BillingCustomerFormSkeleton(): React.JSX.Element {
    return (
        <>
            <div className="grid grid-cols-12 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={`full-${i}`} className="col-span-12">
                        <div className="mb-2 flex flex-col space-y-2">
                            <Skeleton className="h-3.5 w-[200px]" />
                            <Skeleton className="h-9 w-full" />
                        </div>
                    </div>
                ))}
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`half-${i}`} className="col-span-6">
                        <div className="mb-2 flex flex-col space-y-2">
                            <Skeleton className="h-3.5 w-[200px]" />
                            <Skeleton className="h-9 w-full" />
                        </div>
                    </div>
                ))}
            </div>
            <Separator />
            <Skeleton className="h-9 w-16" />
        </>
    );
}
