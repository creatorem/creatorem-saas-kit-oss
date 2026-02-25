'use client';

import type { BillingConfig, BillingList, BillingPrice, BillingProduct } from '@kit/billing-types';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/ui/empty';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Icon } from '@kit/ui/icon';
import { RadioGroup, RadioGroupItem } from '@kit/ui/radio-group';
import { Separator } from '@kit/ui/separator';
import { cn, formatCurrency } from '@kit/utils';
import { useZodForm } from '@kit/utils/hooks/use-zod-form';
import React, { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { z } from 'zod';
import { getProductAndPrice } from '../utils/products';

export type DashboardPlanFormProps = {
    config: BillingConfig;
    onSubmit: (data: { priceId: string; productId: string }) => void;
    products: BillingList<BillingProduct>;
    canStartTrial?: boolean;
    pending?: boolean;
};

const INTERVAL_LABELS = {
    day: 'Daily',
    week: 'Weekly',
    month: 'Monthly',
    year: 'Yearly',
};

/**
 * Find all interval values
 */
const getIntervalValues = (products: BillingProduct[]): NonNullable<BillingPrice['recurring']['interval']>[] => {
    const intervals = products.flatMap((product) => product.prices.map((price) => price.recurring.interval));

    return [...new Set(intervals.filter((interval) => interval !== null))];
};

export function DashboardPlanForm({
    onSubmit,
    canStartTrial,
    pending,
    products,
    config,
}: DashboardPlanFormProps): React.JSX.Element {
    const form = useZodForm({
        schema: z
            .object({
                priceId: z.string(),
                productId: z.string(),
                interval: z.string().optional(),
            })
            .refine(
                (data) => {
                    try {
                        return config.products.find((product) => product.id === data.productId);
                    } catch {
                        return false;
                    }
                },
                { message: 'Invalid product', path: ['productId'] },
            ),
        reValidateMode: 'onChange',
        mode: 'onChange',
        defaultValues: {
            interval: getIntervalValues(products.data)?.[0] ?? undefined,
            priceId: '',
            productId: '',
        },
    });

    const intervalValues = useMemo(() => getIntervalValues(products.data), [products.data]);

    const selectedInterval = useWatch({
        name: 'interval',
        control: form.control,
    });

    const priceId = form.getValues('priceId');

    const { price: selectedPrice, product: selectedProduct } = useMemo(() => {
        return getProductAndPrice(products.data, priceId);
    }, [products.data, priceId]);

    // display the period picker if the selected plan is recurring or if no plan is selected
    const isRecurringPlan = selectedPrice?.type === 'recurring' || !selectedPrice;

    // Always filter out hidden products
    const activeProducts = products.data.filter((product) => product.active);

    if (!intervalValues.length) {
        return (
            <Empty className="min-h-76">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Icon name="Box" className="size-6" />
                    </EmptyMedia>
                    <EmptyTitle>No intervals found.</EmptyTitle>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <Form {...form}>
            <div className={'flex flex-col gap-y-4 lg:flex-row lg:gap-x-4 lg:gap-y-0'}>
                <form className={'flex w-full max-w-xl flex-col gap-y-8'} onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        name={'priceId'}
                        render={({ field }) => (
                            <FormItem className={'flex flex-col gap-4'}>
                                <div className="flex w-full items-end justify-between">
                                    <FormLabel>
                                        <span>Plan</span>
                                    </FormLabel>

                                    {intervalValues.length && (
                                        <div
                                            className={cn('transition-all', {
                                                'pointer-events-none opacity-50': !isRecurringPlan,
                                            })}
                                        >
                                            <FormField
                                                name={'interval'}
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem className={'flex flex-col gap-4'}>
                                                            <FormControl>
                                                                <RadioGroup name={field.name} value={field.value}>
                                                                    {/* <div className={'flex'}> */}
                                                                    <div className={'flex rounded-full border p-1'}>
                                                                        {intervalValues.map((interval) => {
                                                                            const selected = field.value === interval;

                                                                            return (
                                                                                <label
                                                                                    htmlFor={interval}
                                                                                    key={interval}
                                                                                    className={cn(
                                                                                        'group flex items-center gap-2 rounded-full px-2 py-1 focus:outline-hidden',
                                                                                        'has-[:checked]:bg-primary has-checked:text-white',
                                                                                    )}
                                                                                >
                                                                                    <RadioGroupItem
                                                                                        id={interval}
                                                                                        value={interval}
                                                                                        className="hidden"
                                                                                        onClick={() => {
                                                                                            form.setValue(
                                                                                                'interval',
                                                                                                interval,
                                                                                                {
                                                                                                    shouldValidate: true,
                                                                                                },
                                                                                            );

                                                                                            if (selectedProduct) {
                                                                                                const price =
                                                                                                    selectedProduct.prices.find(
                                                                                                        (priceItem) =>
                                                                                                            priceItem
                                                                                                                .recurring
                                                                                                                .interval ===
                                                                                                            interval,
                                                                                                    );

                                                                                                form.setValue(
                                                                                                    'priceId',
                                                                                                    price?.id ?? '',
                                                                                                    {
                                                                                                        shouldValidate: true,
                                                                                                        shouldDirty: true,
                                                                                                        shouldTouch: true,
                                                                                                    },
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                    />

                                                                                    <span
                                                                                        className={cn(
                                                                                            'text-xs capitalize',
                                                                                            {
                                                                                                'cursor-pointer':
                                                                                                    !selected,
                                                                                            },
                                                                                        )}
                                                                                    >
                                                                                        {INTERVAL_LABELS[interval]}
                                                                                    </span>
                                                                                </label>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </RadioGroup>
                                                            </FormControl>

                                                            <FormMessage />
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <FormControl>
                                    <RadioGroup
                                        value={field.value}
                                        name={field.name}
                                        className="bg-background relative block -space-y-px rounded-md"
                                    >
                                        {activeProducts.map((product) => {
                                            const price = product.prices.find((priceItem) => {
                                                if (priceItem.type === 'one_time') {
                                                    return true;
                                                }

                                                return priceItem.recurring.interval === selectedInterval;
                                            });

                                            if (!price) {
                                                return null;
                                            }

                                            const selected = field.value === price.id;

                                            return (
                                                <label
                                                    key={price.id}
                                                    htmlFor={price.id}
                                                    className={cn(
                                                        'group flex cursor-pointer flex-col border p-4 first:rounded-tl-md first:rounded-tr-md last:rounded-br-md last:rounded-bl-md focus:outline-hidden md:pr-6 md:pl-4',
                                                        'has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-checked:relative has-checked:cursor-default',
                                                        'hover:bg-accent',
                                                    )}
                                                >
                                                    <div className="flex flex-col md:flex-row md:justify-between md:gap-x-4">
                                                        <span className="flex items-center gap-3 text-sm">
                                                            <RadioGroupItem
                                                                key={price.id + selected}
                                                                id={price.id}
                                                                value={price.id}
                                                                onClick={() => {
                                                                    if (selected) {
                                                                        return;
                                                                    }

                                                                    form.setValue('priceId', price.id, {
                                                                        shouldValidate: true,
                                                                    });

                                                                    form.setValue('productId', product.id, {
                                                                        shouldValidate: true,
                                                                    });
                                                                }}
                                                            />
                                                            <div className="flex items-center gap-1">
                                                                {product.popular && (
                                                                    <Icon
                                                                        name="BadgeCheck"
                                                                        className={'fill-primary size-5 text-white'}
                                                                    />
                                                                )}

                                                                <span className="group-has-[:checked]:text-primary text-foreground text-base font-semibold">
                                                                    {product.name}
                                                                </span>
                                                            </div>

                                                            {price.recurring.trialPeriodDays && canStartTrial && (
                                                                <div>
                                                                    <Badge
                                                                        className={'px-1 py-0.5 text-xs'}
                                                                        variant={'success'}
                                                                    >
                                                                        {price.recurring.trialPeriodDays} days trial
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </span>
                                                        <span className="ml-6 pl-1 text-sm md:ml-0 md:pl-0 md:text-center">
                                                            <span className="group-has-[:checked]:text-primary text-foreground text-base font-semibold">
                                                                {formatCurrency({
                                                                    value: price.amount / 100,
                                                                    currencyCode: price.currency,
                                                                    locale: 'fr-FR',
                                                                    numberAfterComma: config.numberAfterComma,
                                                                })}
                                                            </span>
                                                            {price.type === 'recurring' && (
                                                                <span className="text-muted-foreground group-has-[:checked]:text-primary/70">
                                                                    {' '}
                                                                    / {price.recurring.interval}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>

                                                    <span className="ml-6 pl-1 text-sm md:pt-2">
                                                        {product.description}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </RadioGroup>
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div>
                        <Button disabled={pending ?? !form.formState.isValid} aria-label="Proceed to payment">
                            {pending ? (
                                'Redirecting to payment...'
                            ) : (
                                <>
                                    {selectedPrice?.recurring.trialPeriodDays && canStartTrial ? (
                                        <span>Start Trial</span>
                                    ) : (
                                        <span>Proceed to payment</span>
                                    )}

                                    <Icon name="ArrowRight" className={'ml-2 h-4 w-4'} />
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {selectedPrice && selectedInterval && selectedProduct ? (
                    <SubscriptionDetails product={selectedProduct} price={selectedPrice} />
                ) : null}
            </div>
        </Form>
    );
}

function SubscriptionDetails({ product, price }: { product: BillingProduct; price: BillingPrice }) {
    const isRecurring = price.type === 'recurring';

    return (
        <div className={'fade-in animate-in zoom-in-95 flex w-full flex-col space-y-4 py-2 lg:px-8'}>
            <div className={'flex flex-col space-y-0.5'}>
                <span className={'flex flex-wrap items-center gap-x-2 text-sm font-medium'}>
                    <h3 className="text-lg font-semibold">{product.name}</h3>{' '}
                    {product.popular && (
                        <Badge className={'rounded-full pl-1'}>
                            <Icon name="BadgeCheck" className={'mr-1 size-4'} />
                            Most popular
                        </Badge>
                    )}
                    {isRecurring ? (
                        <Badge variant="outline" className={'rounded-full'}>
                            Subscription
                        </Badge>
                    ) : (
                        <Badge variant={'outline'} className={'rounded-full'}>
                            One-time
                        </Badge>
                    )}
                </span>

                <p>
                    <span className={'text-muted-foreground text-sm'}>{product.description}</span>
                </p>
            </div>

            <Separator />

            <div className="flex items-start gap-2">
                <div className={cn('flex flex-col space-y-2', product.imageUrl ? 'max-w-[500px] pr-8' : 'w-full')}>
                    <span className={'text-sm font-semibold'}>Features</span>

                    {product.features.map((item) => {
                        return (
                            <div key={item} className={'flex items-start gap-x-2 text-sm'}>
                                <Icon name="Check" className={'mt-0.5 size-4 min-w-4 text-green-500'} />

                                <span className={'text-secondary-foreground'}>{item}</span>
                            </div>
                        );
                    })}
                </div>

                {/* <Image src={product.imageUrl} alt={product.name} width={100} height={100} /> */}
                {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.name} width={200} height={200} className="rounded-md" />
                )}
            </div>
        </div>
    );
}
