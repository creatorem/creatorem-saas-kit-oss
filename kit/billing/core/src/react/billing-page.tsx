import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { BillingConfig } from '@kit/billing-types';
import { Button } from '@kit/ui/button';
import { Separator } from '@kit/ui/separator';
import { Skeleton } from '@kit/ui/skeleton';
import { Muted } from '@kit/ui/text';
import React from 'react';
import { billingRouter } from '../router/router';
import { BillingCustomerForm } from './components/billing-customer-form';
import { BillingInvoiceTable } from './components/billing-invoice-table';
import { BillingSubscriptionSelector } from './components/billing-subscription-selector';
import { SubscriptionPlanDetails } from './components/subscription-plan-details';
import { TestModeNotice } from './components/test-mode-notice';

export function BillingPage({
    config,
    clientTrpc,
}: {
    config: BillingConfig;
    clientTrpc: TrpcClientWithQuery<typeof billingRouter>;
}) {
    const billingDetails = clientTrpc.getBillingDetails.useQuery({ input: { config } });

    if (billingDetails.isPending || !billingDetails.data) {
        return (
            <>
                <div className="space-y-4 px-4 py-8 sm:px-8">
                    <div className="mb-4 flex flex-col gap-2">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-24 w-xl" />
                    <Skeleton className="h-12 w-xl" />
                    <Skeleton className="h-44 w-xl" />
                    <Skeleton className="h-9 w-24" />
                </div>

                <Separator />

                <div className="space-y-4 px-4 py-8 sm:px-8">
                    <div className="mb-4 flex flex-col gap-2">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-4 w-2xl" />
                    </div>
                    <Skeleton className="h-10 w-lg" />
                    <Skeleton className="h-10 w-lg" />
                    <Skeleton className="h-10 w-lg" />
                    <Skeleton className="h-10 w-lg" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </>
        );
    }

    const { customer, products, subscriptions, invoices } = billingDetails.data;

    return (
        <>
            <div className="space-y-4 px-4 py-8 sm:px-8">
                <div className="flex flex-col gap-2">
                    <div className="text-2xl font-bold">Subscriptions</div>
                    <Muted>View and manage your subscriptions.</Muted>
                </div>
                {customer.isTestMode && <TestModeNotice isCheckout={subscriptions.data.length === 0} />}
                <div className="space-y-4">
                    {subscriptions.data.length === 0 ? (
                        <BillingSubscriptionSelector config={config} products={products} clientTrpc={clientTrpc} />
                    ) : (
                        <div className="flex flex-wrap gap-6">
                            {subscriptions.data.map((subscription) => (
                                <React.Fragment key={subscription.id}>
                                    <SubscriptionPlanDetails
                                        config={config}
                                        subscription={subscription}
                                        className="w-lg max-md:w-full"
                                        clientTrpc={clientTrpc}
                                    />
                                </React.Fragment>
                            ))}
                            {subscriptions.hasMore && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    // no implementation yet
                                    disabled={true}
                                    aria-label="Load more subscriptions"
                                >
                                    Load more
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Separator />
            <div className="space-y-4 px-4 py-8 sm:px-8">
                <div className="flex flex-col gap-2">
                    <div className="text-2xl font-bold">Customer</div>
                    <Muted>Manage your billing information. Allow you to update your data in the invoices.</Muted>
                </div>
                <div className="max-w-lg">
                    <BillingCustomerForm customer={customer} config={config} clientTrpc={clientTrpc} />
                </div>
            </div>
            <Separator />
            <div className="space-y-4 px-4 py-8 sm:px-8">
                <div className="flex flex-col gap-2">
                    <div className="text-2xl font-bold">Invoices</div>
                    <Muted>View and manage your invoices.</Muted>
                </div>

                <div className="max-w-lg">
                    <BillingInvoiceTable invoices={invoices} numberAfterComma={config.numberAfterComma ?? 2} />
                </div>
            </div>
        </>
    );
}
