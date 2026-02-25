/**
 * Compound of components built on top of the PricingPlans component
 * to handle recurring pricing plans
 */

'use client';

import { BillingPrice, BillingProduct } from '@kit/billing-types';
import { RadioGroup, RadioGroupItem } from '@kit/ui/radio-group';
import { cn } from '@kit/utils';
import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { PricingPlans, PricingRoot, PricingRootProps } from './pricing';

const INTERVAL_LABELS = {
    day: 'Daily',
    week: 'Weekly',
    month: 'Monthly',
    year: 'Yearly',
} as const;

type IntervalType = NonNullable<BillingPrice['recurring']['interval']>;

const getIntervalValues = (products: BillingProduct[]): IntervalType[] => {
    const intervals = products
        .flatMap((product: BillingProduct) => product.prices.map((price: BillingPrice) => price.recurring?.interval))
        .filter(Boolean) as string[];

    return [...new Set(intervals)] as IntervalType[];
};

interface RecurringPricingContextValue {
    interval: IntervalType;
    setInterval: (interval: IntervalType) => void;
    intervalValues: IntervalType[];
}

export const RecurringPricingContext = createContext<RecurringPricingContextValue | null>(null);

const useRecurringPricing = () => {
    const context = useContext(RecurringPricingContext);
    if (!context) {
        throw new Error('useRecurringPricing must be used within RecurringPricingRoot');
    }
    return context;
};

type RecurringPricingRootProps = PricingRootProps;

export const RecurringPricingRoot: React.FC<RecurringPricingRootProps> = ({ children, config, products }) => {
    const intervalValues = useMemo(() => getIntervalValues(products.data), [products.data]);
    const [interval, setInterval] = useState<IntervalType>(intervalValues[0] ?? 'month');

    return (
        <PricingRoot products={products} config={config}>
            <RecurringPricingContext.Provider
                value={{
                    interval,
                    setInterval,
                    intervalValues,
                }}
            >
                {children}
            </RecurringPricingContext.Provider>
        </PricingRoot>
    );
};

export const RecurringPricingIntervalSelector: React.FC = () => {
    const { interval, setInterval, intervalValues } = useRecurringPricing();

    return (
        <RadioGroup name="interval" value={interval} onValueChange={(value) => setInterval(value as IntervalType)}>
            <div className="mx-auto flex rounded-full border p-1">
                {intervalValues.map((itvlValue) => {
                    const selected = itvlValue === interval;

                    return (
                        <label
                            htmlFor={itvlValue}
                            key={itvlValue}
                            className={cn('group flex items-center gap-2 rounded-full px-2 py-1 focus:outline-none', {
                                'bg-primary text-primary-foreground': selected,
                            })}
                        >
                            <RadioGroupItem
                                id={itvlValue}
                                value={itvlValue}
                                className="hidden"
                                onClick={() => {
                                    setInterval(itvlValue);
                                }}
                            />
                            <span
                                className={cn('text-xs font-semibold capitalize', {
                                    'cursor-pointer': !selected,
                                })}
                            >
                                {INTERVAL_LABELS[itvlValue as keyof typeof INTERVAL_LABELS]}
                            </span>
                        </label>
                    );
                })}
            </div>
        </RadioGroup>
    );
};

interface RecurringPricingPlansProps {
    children: ReactNode;
}

export const RecurringPricingPlans: React.FC<RecurringPricingPlansProps> = ({ children }) => {
    const { interval } = useRecurringPricing();
    console.log({ interval });

    const priceFilter = useCallback(
        (p: BillingPrice) => p.type === 'recurring' && p.recurring?.interval === interval,
        [interval],
    );

    return <PricingPlans priceFilter={priceFilter}>{children}</PricingPlans>;
};

export const RecurringPricingInterval: React.FC = () => {
    const { interval } = useRecurringPricing();
    return <>{interval}</>;
};
