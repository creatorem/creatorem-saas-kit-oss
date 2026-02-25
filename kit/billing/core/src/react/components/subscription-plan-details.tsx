'use client';

import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { BillingConfig, BillingSubscription } from '@kit/billing-types';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@kit/ui/card';
import { Icon } from '@kit/ui/icon';
import { Separator } from '@kit/ui/separator';
import { Skeleton } from '@kit/ui/skeleton';
import { toast } from '@kit/ui/sonner';
import { cn } from '@kit/utils';
import { differenceInDays, format } from 'date-fns';
import React from 'react';
import type { billingRouter } from '../../router/router';

export type SubscriptionPlanDetailsProps = React.HtmlHTMLAttributes<HTMLDivElement> & {
    config: BillingConfig;
    subscription: BillingSubscription;
    clientTrpc: TrpcClientWithQuery<typeof billingRouter>;
};

const INTERVAL_LABELS = {
    day: 'Daily',
    week: 'Weekly',
    month: 'Monthly',
    year: 'Yearly',
};

export function SubscriptionPlanDetails({
    config,
    subscription,
    className,
    clientTrpc,
}: SubscriptionPlanDetailsProps): React.JSX.Element {
    const [loading, setLoading] = React.useState<boolean>(false);

    const billingCycleStart = subscription.currentPeriodStart
        ? new Date(subscription.currentPeriodStart * 1000)
        : undefined;
    const billingCycleEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd * 1000) : undefined;
    const daysToCycleEnd = billingCycleEnd ? differenceInDays(billingCycleEnd, new Date()) : 0;
    const daysWithinCycle =
        billingCycleEnd && billingCycleStart ? differenceInDays(billingCycleEnd, billingCycleStart) : 0;

    // Format the amount with currency
    const formatAmount = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount / 100); // Assuming amount is in cents
    };

    const handleBillingPortalRedirect = async (): Promise<void> => {
        const result = await clientTrpc.createBillingPortalSessionUrl.fetch({
            config: config,
            returnUrl: window.location.href,
        });
        if (result?.url) {
            window.location.href = result.url;
        } else {
            toast.error('Failed to create billing portal session. Please try again.');
        }
    };

    const handleBillingRedirect = async (): Promise<void> => {
        setLoading(true);
        try {
            await handleBillingPortalRedirect();
            // do not stop loading, as if it works it will redirect to the billing portal
        } catch (error) {
            console.error('Billing redirect error:', error);
            toast.error('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <Card className={cn('w-full', className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {subscription.status === 'active' ? (
                        <Icon name="BadgeCheck" className="h-6 w-6 fill-green-500 text-white" />
                    ) : (
                        <Icon name="BadgeX" className="h-6 w-6 fill-red-500 text-white" />
                    )}
                    <span>{subscription.name}</span>
                    <Badge
                        // variant={subscription.status === 'active' ? 'default' : 'secondary'}
                        variant={
                            subscription.status === 'active' && !subscription.cancelAtPeriodEnd
                                ? 'success'
                                : 'destructive'
                        }
                        className="ml-auto rounded-full"
                    >
                        {subscription.cancelAtPeriodEnd
                            ? 'Canceled at period end'
                            : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </Badge>
                </CardTitle>
                {subscription.description && (
                    <p className="text-muted-foreground text-sm">{subscription.description}</p>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Subscription Details */}

                <div className="space-y-2">
                    {/* Price */}
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">
                            {formatAmount(subscription.amount, subscription.currency)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                            /{' '}
                            <Badge variant="secondary" className="rounded-full text-xs">
                                {INTERVAL_LABELS[subscription.interval]}
                            </Badge>
                        </span>
                    </div>

                    {/* Subscription Creation Date */}
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Icon name="Calendar" className="h-3 w-3" />
                        <span>Created {billingCycleStart ? format(billingCycleStart, 'MMM dd, yyyy') : 'N/A'}</span>
                    </div>

                    {subscription.intervalCount && (
                        <div className="text-muted-foreground flex items-center gap-2 text-xs capitalize">
                            <Icon name="Tally5" className="h-3 w-3" />
                            <span>
                                {subscription.intervalCount === 1
                                    ? 'first'
                                    : subscription.intervalCount === 2
                                      ? 'second'
                                      : subscription.intervalCount === 3
                                        ? 'third'
                                        : `${subscription.intervalCount}th`}{' '}
                                cycle{subscription.intervalCount <= 1 ? '' : 's'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex w-full flex-col">
                    <div className="flex justify-between space-x-8 pb-1 align-baseline">
                        <p className="capitalize-sentence text-foreground max-w-[75%] truncate text-xs">
                            {`Current billing cycle (${billingCycleStart ? formatCycleDate(Number(billingCycleStart)) : ''} - ${billingCycleEnd ? formatCycleDate(Number(billingCycleEnd)) : ''})`}
                        </p>
                        <p className="text-muted-foreground text-xs">{`${daysToCycleEnd} days remaining`}</p>
                    </div>
                    <div className="bg-muted relative h-1 w-full overflow-hidden rounded-sm p-0">
                        <div
                            className="bg-foreground absolute inset-x-0 bottom-0 h-1 rounded-sm transition-all"
                            style={{
                                width: `${Number(((daysWithinCycle - daysToCycleEnd) / daysWithinCycle) * 100)}%`,
                            }}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    loading={loading}
                    onClick={handleBillingRedirect}
                    aria-label="Manage subscription"
                >
                    Manage Subscription
                </Button>
            </CardFooter>
        </Card>
    );
}

function formatCycleDate(timestamp: number): string {
    return format(new Date(timestamp * 1000), 'MMM dd');
}

// skeleton version
export function SubscriptionPlanDetailsSkeleton(): React.JSX.Element {
    return (
        <Card className="w-full">
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                </div>
                <Separator />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-40" />
                </div>
            </CardContent>
        </Card>
    );
}
