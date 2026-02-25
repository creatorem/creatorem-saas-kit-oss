'use client';

import { PlanUsage } from '@kit/billing/ui';
import { Alert, AlertDescription } from '@kit/ui/alert';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/ui/empty';
import { Icon } from '@kit/ui/icon';
import { Separator } from '@kit/ui/separator';
import { Skeleton } from '@kit/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kit/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@kit/ui/tooltip';
import { cn } from '@kit/utils';
import { ChartNoAxesCombinedIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AiUsageChart } from './ai-usage-chart';
import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { aiRouter } from '../../router/router';
import { AiConfig } from '../../config';
import { BillingConfig } from '@kit/billing';

export interface AiUsageRecord {
    id: string;
    modelId: string;
    inputTokens: number;
    outputTokens: number;
    reasoningTokens: number;
    cachedInputTokens: number;
    cost: number;
    aiTimestamp: string;
    createdAt: string;
}

export interface AiUsageData {
    currentUsage: number;
    includedAmount: number;
    productId: string;
    periodStartDate: number;
    periodEndDate: number;
    usageRecords: AiUsageRecord[];
}

export interface UserAiPlanUsageProps {
    /**
     * Optional className for styling
     */
    className?: string;
    clientTrpc: TrpcClientWithQuery<typeof aiRouter>;
    billingConfig?: BillingConfig;
    aiConfig: AiConfig;
}

export function UserAiPlanUsage({ className, clientTrpc, billingConfig: billingConfigProp, aiConfig }: UserAiPlanUsageProps) {
    const [usageData, setUsageData] = useState<AiUsageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const billingConfig = useMemo(() => {
        if (!billingConfigProp) {
            throw new Error('billingConfig must be provided to use UserAiPlanUsage')
        }
        return billingConfigProp
    }, [billingConfigProp])

    useEffect(() => {
        async function fetchUsage() {
            try {
                setIsLoading(true);
                setError(null);

                const data = await clientTrpc.getAiUsage.fetch({ billingConfig, aiConfig });
                setUsageData(data);
            } catch (err) {
                console.error('Failed to fetch AI usage:', err);
                setError('Failed to load usage data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchUsage();
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <div className={className}>
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="mb-3 h-3 w-full" />
                <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
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

    // No data available (no subscription, feature not configured, etc.)
    if (!usageData) {
        return (
            <Empty className="h-full min-h-72 rounded-md border border-dashed">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <ChartNoAxesCombinedIcon className="size-6" />
                    </EmptyMedia>
                    <EmptyTitle>No usage data available</EmptyTitle>
                    <EmptyDescription>
                        Ask the AI assistant to help you with your questions. You will see usage data here after your
                        first request.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const formatTokens = (tokens: number) => {
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
        }).format(tokens);
    };

    return (
        <div className={cn('space-y-6', className)}>
            <PlanUsage
                currentUsage={usageData.currentUsage}
                maxUsage={usageData.includedAmount}
                currencySymbol="$"
                variant="compact"
                label="AI Usage This Period"
                periodEndDate={usageData.periodEndDate}
            />

            <AiUsageChart
                usageRecords={usageData.usageRecords}
                periodStartDate={usageData.periodStartDate}
                periodEndDate={usageData.periodEndDate}
            />

            {usageData.usageRecords.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium">Usage History</h4>
                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Kind</TableHead>
                                    <TableHead className="text-right">Tokens</TableHead>
                                    <TableHead className="text-right">Cost</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usageData.usageRecords.map((record) => (
                                    <TableRow key={record.id} className="border-b-0 text-xs">
                                        <TableCell>{formatDate(record.createdAt)}</TableCell>
                                        <TableCell className="font-mono">{record.modelId}</TableCell>
                                        <TableCell className="">Included</TableCell>
                                        <TableCell className="text-muted-foreground flex text-right">
                                            <span className="ml-auto flex items-center gap-1">
                                                {formatTokens(
                                                    record.inputTokens +
                                                    record.outputTokens +
                                                    record.reasoningTokens +
                                                    record.cachedInputTokens,
                                                )}
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Icon name="BadgeInfo" className="size-4" />
                                                    </TooltipTrigger>
                                                    <TooltipContent
                                                        side="right"
                                                        className="flex w-32 flex-col gap-2 p-2 text-xs"
                                                    >
                                                        <div className="flex w-full items-center justify-between gap-4">
                                                            <span>Input</span>
                                                            <span>{record.inputTokens}</span>
                                                        </div>
                                                        <div className="flex w-full items-center justify-between gap-4">
                                                            <span>Output</span>
                                                            <span>{record.outputTokens}</span>
                                                        </div>
                                                        <div className="flex w-full items-center justify-between gap-4">
                                                            <span>Reasoning</span>
                                                            <span>{record.reasoningTokens}</span>
                                                        </div>
                                                        <div className="flex w-full items-center justify-between gap-4">
                                                            <span>Cached</span>
                                                            <span>{record.cachedInputTokens}</span>
                                                        </div>
                                                        <Separator />
                                                        <div className="flex w-full items-center justify-between gap-4">
                                                            <span>Total</span>
                                                            <span>
                                                                {record.inputTokens +
                                                                    record.outputTokens +
                                                                    record.reasoningTokens +
                                                                    record.cachedInputTokens}
                                                            </span>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-muted-foreground">
                                                {Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: 'USD',
                                                    minimumFractionDigits: 2,
                                                    currencySign: 'accounting',
                                                    roundingMode: 'ceil',
                                                }).format(record.cost)}
                                            </span>
                                            <span className="text-foreground ml-1">Included</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}
