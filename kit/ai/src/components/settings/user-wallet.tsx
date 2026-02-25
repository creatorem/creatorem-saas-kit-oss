'use client';

import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import type { BillingConfig, WalletBalance, WalletTransaction } from '@kit/billing';
import type { billingRouter } from '@kit/billing/router';
import { AiWalletTransaction } from '@kit/drizzle';
import { Alert, AlertDescription } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@kit/ui/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/ui/empty';
import { Icon } from '@kit/ui/icon';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@kit/ui/item';
import { Skeleton } from '@kit/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kit/ui/table';
import { cn } from '@kit/utils';
import { useEffect, useMemo, useState } from 'react';

export interface UserWalletProps {
    /**
     * Optional className for styling
     */
    className?: string;
    /**
     * TRPC client for billing operations
     */
    clientTrpc: TrpcClientWithQuery<typeof billingRouter>;
    billingConfig?: BillingConfig;
}

export function UserWallet({ className, clientTrpc, billingConfig: billingConfigProp }: UserWalletProps) {
    const [balance, setBalance] = useState<WalletBalance | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
    const billingConfig = useMemo(() => {
        if (!billingConfigProp) {
            throw new Error('billingConfig must be provided to use UserAiPlanUsage')
        }
        return billingConfigProp
    }, [billingConfigProp])

    useEffect(() => {
        async function fetchWalletData() {
            try {
                setIsLoading(true);
                setError(null);

                const [balanceResult, transactionsResult] = await Promise.all([
                    clientTrpc.getWalletBalance.fetch(),
                    clientTrpc.getWalletTransactions.fetch({ limit: 20 }),
                ]);

                if (balanceResult.error || !balanceResult.data) {
                    throw new Error(balanceResult.error || 'Failed to load wallet balance');
                }

                if (transactionsResult.error || !transactionsResult.data) {
                    throw new Error(transactionsResult.error || 'Failed to load transactions');
                }

                setBalance(balanceResult.data);
                setTransactions(transactionsResult.data);
            } catch (err) {
                console.error('Failed to fetch wallet data:', err);
                setError('Failed to load wallet data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchWalletData();

        // Check for checkout success/cancelled query params
        const urlParams = new URLSearchParams(window.location.search);
        const checkoutStatus = urlParams.get('checkout');

        if (checkoutStatus === 'success') {
            // Remove query param from URL
            window.history.replaceState({}, '', window.location.pathname);
            // Show success message (you can enhance this with a toast notification)
            setError(null);
            // Optionally refetch wallet data after a short delay
            setTimeout(() => fetchWalletData(), 2000);
        } else if (checkoutStatus === 'cancelled') {
            // Remove query param from URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [clientTrpc]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const formatCurrency = (amount: number) => {
        const absAmount = Math.abs(amount);

        // For amounts >= 0.01, use exactly 2 decimal places
        if (absAmount >= 0.01) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount);
        }

        // For very small amounts, show enough precision to see at least 2 significant digits
        // Calculate how many decimal places needed
        let decimalPlaces = 2;
        if (absAmount > 0) {
            // Find the first non-zero digit after decimal point
            decimalPlaces = Math.ceil(-Math.log10(absAmount)) + 1;
            // Cap at 8 decimal places for sanity
            decimalPlaces = Math.min(decimalPlaces, 8);
        }

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
        }).format(amount);
    };

    const getTransactionTypeColor = (type: string) => {
        switch (type) {
            case 'deposit':
            case 'refund':
                return 'text-green-600 dark:text-green-400';
            case 'usage':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-muted-foreground';
        }
    };

    const getTransactionTypeIcon = (type: AiWalletTransaction['type']) => {
        switch (type) {
            case 'deposit':
                return <Icon name="ArrowDownToLine" className="size-4" />;
            case 'usage':
                return <Icon name="ArrowUpFromLine" className="size-4" />;
            case 'refund':
                return <Icon name="ArrowDownToLine" className="size-4" />;
            case 'adjustment':
                return <Icon name="FileText" className="size-4" />;
        }
    };

    const presetAmounts = [5, 10, 25, 50, 100];

    const handleTopUp = async () => {
        if (!selectedAmount) return;

        try {
            setIsCreatingCheckout(true);

            // Get current URL for success/cancel redirects
            const currentUrl = window.location.origin + window.location.pathname;
            const successUrl = `${currentUrl}?checkout=success`;
            const cancelUrl = `${currentUrl}?checkout=cancelled`;

            // Create checkout session
            const result = await clientTrpc.createWalletCheckout.fetch({
                config: billingConfig,
                amount: selectedAmount,
                successUrl,
                cancelUrl,
            });

            if (result.error || !result.data) {
                throw new Error(result.error || 'Failed to create checkout session');
            }

            // Redirect to Stripe checkout
            window.location.href = result.data.checkoutUrl;
        } catch (err) {
            console.error('Failed to create checkout session:', err);
            setError('Failed to create checkout session. Please try again.');
            setIsCreatingCheckout(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className={cn('space-y-4', className)}>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <Alert variant="destructive" className={className}>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    // No data available
    if (!balance) {
        return null;
    }

    return (
        <div className={cn('space-y-6', className)}>
            <Item variant="outline" className="bg-card rounded-lg" size="sm">
                <ItemMedia>
                    <Icon name="Wallet" className="size-5" />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>AI Wallet Balance</ItemTitle>
                    <div className="flex items-baseline gap-1">
                        <span className={cn('text-lg font-bold', balance.balance < 0 ? 'text-red-600' : '')}>
                            {formatCurrency(balance.balance)}
                        </span>
                        <span className="text-muted-foreground text-xs">{balance.currency}</span>
                    </div>
                </ItemContent>
                <ItemActions>
                    <Dialog open={isTopUpDialogOpen} onOpenChange={setIsTopUpDialogOpen}>
                        <DialogTrigger asChild>
                            <Button aria-label="Add funds" variant="default" size="sm">
                                <Icon name="Plus" className="size-4" />
                                Add funds
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add funds to your wallet</DialogTitle>
                                <DialogDescription>
                                    Add funds to your AI wallet to continue using AI features after your plan's included
                                    credits are exhausted.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {presetAmounts.map((amount) => (
                                        <Button
                                            key={amount}
                                            aria-label={`Top Up with $${amount}`}
                                            variant={selectedAmount === amount ? 'default' : 'outline'}
                                            onClick={() => setSelectedAmount(amount)}
                                            className="h-16 flex-col gap-1"
                                        >
                                            <span className="text-lg font-bold">${amount}</span>
                                        </Button>
                                    ))}
                                </div>
                                <Alert>
                                    <Icon name="Info" className="size-4" />
                                    <AlertDescription className="text-xs">
                                        Funds will be added to your wallet immediately after successful payment. Your
                                        wallet balance never expires.
                                    </AlertDescription>
                                </Alert>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    aria-label="Cancel"
                                    onClick={() => setIsTopUpDialogOpen(false)}
                                    disabled={isCreatingCheckout}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleTopUp}
                                    aria-label="Continue to Payment"
                                    disabled={!selectedAmount || isCreatingCheckout}
                                    loading={isCreatingCheckout}
                                >
                                    {isCreatingCheckout ? 'Processing...' : 'Continue to Payment'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </ItemActions>
            </Item>

            {/* Transactions Table */}
            {transactions.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium">Transaction History</h4>
                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Balance After</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id} className="border-b-0 text-xs">
                                        <TableCell>{formatDate(tx.createdAt)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className={cn(getTransactionTypeColor(tx.type))}>
                                                    {getTransactionTypeIcon(tx.type)}
                                                </span>
                                                <span className="capitalize">{tx.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground max-w-xs truncate">
                                            {tx.description}
                                        </TableCell>
                                        <TableCell className={cn('text-right', getTransactionTypeColor(tx.type))}>
                                            {tx.amount > 0 ? '+' : ''}
                                            {formatCurrency(tx.amount)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-right">
                                            {formatCurrency(tx.balanceAfter)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {transactions.length === 0 && (
                <Empty className="h-full min-h-72 rounded-md border border-dashed">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Icon name="Wallet" className="size-6" />
                        </EmptyMedia>
                        <EmptyTitle>No transactions yet</EmptyTitle>
                        <EmptyDescription>Top up your wallet to see transaction history</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}
        </div>
    );
}
