'use client';

import { BillingConfig, BillingList, BillingProduct } from '@kit/billing-types';
import { Badge } from '@kit/ui/badge';
import { Icon } from '@kit/ui/icon';
import { cn } from '@kit/utils';
import React from 'react';
import {
    PricingFeatures,
    PricingIfHasTrial,
    PricingIfPopular,
    PricingPlanItem,
    PricingProduct,
    PricingProductFormatCurrency,
    PricingProductLink,
} from './pricing';
import {
    RecurringPricingInterval,
    RecurringPricingIntervalSelector,
    RecurringPricingPlans,
    RecurringPricingRoot,
} from './recurring-pricing';

interface RecurringPricingImplClientProps {
    config: BillingConfig;
    products: BillingList<BillingProduct>;
}

export const RecurringPricingImplClient: React.FC<RecurringPricingImplClientProps> = ({ products, config }) => {
    return (
        <RecurringPricingRoot products={products} config={config}>
            <div className="flex flex-col gap-4">
                <RecurringPricingIntervalSelector />

                <RecurringPricingPlans>
                    <PricingPlanItem className="bg-surface grid grid-cols-1 p-2">
                        <div
                            className={cn(
                                'bg-background overflow-hidden rounded-[30px] border p-10 transition-all',
                                'group-data-[popular=true]/plan-item:ring-primary group-data-[popular=true]/plan-item:border-primary group-data-[popular=true]/plan-item:ring-2',
                            )}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="text-primary text-xl font-semibold">
                                    <PricingProduct attr="product.name" /> <span className="sr-only">plan</span>
                                </h2>
                                <PricingIfPopular>
                                    <Badge className={'rounded-full py-0.5 pl-1 text-sm'}>
                                        <Icon name="BadgeCheck" className={'size-4 min-h-4 min-w-4'} />
                                        Most popular
                                    </Badge>
                                </PricingIfPopular>
                            </div>
                            <p className="text-muted-foreground mt-2 text-sm/6 text-pretty">
                                <PricingProduct attr="product.description" />
                            </p>
                            <div className="mt-8 flex items-center gap-4">
                                <div className="text-foreground text-3xl font-semibold xl:text-5xl">
                                    <PricingProductFormatCurrency />
                                </div>
                                <div className="text-muted-foreground text-sm whitespace-nowrap">
                                    <p>
                                        per <RecurringPricingInterval />
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <PricingProductLink
                                    href={'#'}
                                    className={cn(
                                        'border-primary w-full rounded-full border',
                                        'data-[popular=true]:hover:bg-primary/20 data-[popular=true]:hover:text-primary',
                                        'data-[popular=false]:bg-primary/20 hover:data-[popular=false]:bg-primary data-[popular=false]:dark:bg-primary/10 data-[popular=false]:dark:border-primary/50 data-[popular=false]:text-primary data-[popular=false]:dark:hover:bg-primary/90 data-[popular=false]:hover:text-white',
                                    )}
                                >
                                    <PricingIfHasTrial>Start a free trial</PricingIfHasTrial>
                                    <PricingIfHasTrial fallback>Start now</PricingIfHasTrial>
                                </PricingProductLink>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-foreground text-sm/6 font-medium">Start selling with:</h3>
                                <PricingFeatures />
                            </div>
                        </div>
                    </PricingPlanItem>
                </RecurringPricingPlans>
            </div>
        </RecurringPricingRoot>
    );
};
