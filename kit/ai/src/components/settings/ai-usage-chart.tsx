'use client';

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@kit/ui/chart';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@kit/ui/item';
import { cn } from '@kit/utils';
import { ChartNoAxesCombined } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import type { AiUsageRecord } from './user-ai-plan-usage';

export interface AiUsageChartProps {
    /**
     * Array of AI usage records
     */
    usageRecords: AiUsageRecord[];
    /**
     * Period start date (Unix timestamp in seconds)
     */
    periodStartDate: number;
    /**
     * Period end date (Unix timestamp in seconds)
     */
    periodEndDate: number;
    /**
     * Optional className for styling
     */
    className?: string;
}

interface DailyData {
    date: string;
    dateLabel: string;
    requests: number;
    totalTokens: number;
    cost: number;
    isToday: boolean;
}

const chartConfig = {
    requests: {
        label: 'Requests',
        color: '#00C49F',
    },
    totalTokens: {
        label: 'Tokens',
        color: '#4293ff',
    },
    cost: {
        label: 'Cost ($)',
        color: '#9242ff',
    },
} satisfies ChartConfig;

export function AiUsageChart({ usageRecords, periodStartDate, periodEndDate, className }: AiUsageChartProps) {
    // Helper function to format date in local timezone as YYYY-MM-DD
    const formatDateKey = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Group records by day and calculate metrics
    const dailyDataMap = new Map<string, DailyData>();

    // Get today's date key for comparison (in local timezone)
    const today = new Date();
    const todayKey = formatDateKey(today);

    // Calculate the display date range (limited to 40 days if needed)
    const { startDate, endDate } = calculateDisplayDateRange(periodStartDate, periodEndDate);

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateKey = formatDateKey(date);
        dailyDataMap.set(dateKey, {
            date: dateKey,
            dateLabel: new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
            }).format(date),
            requests: 0,
            totalTokens: 0,
            cost: 0,
            isToday: dateKey === todayKey,
        });
    }

    // Aggregate usage records by day
    usageRecords.forEach((record) => {
        const recordDate = new Date(record.aiTimestamp);
        const dateKey = formatDateKey(recordDate);

        const existing = dailyDataMap.get(dateKey);
        if (existing) {
            existing.requests += 1;
            existing.totalTokens +=
                record.inputTokens + record.outputTokens + record.reasoningTokens + record.cachedInputTokens;
            existing.cost += record.cost;
        }
    });

    // Convert map to sorted array
    const chartData = Array.from(dailyDataMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate statistics
    const totalRequests = chartData.reduce((sum, day) => sum + day.requests, 0);
    const totalCost = chartData.reduce((sum, day) => sum + day.cost, 0);
    const daysWithActivity = chartData.filter((day) => day.requests > 0).length;
    const avgRequestsPerActiveDay = daysWithActivity > 0 ? totalRequests / daysWithActivity : 0;

    // Calculate Y-axis domains with padding
    const allTokens = chartData.map((d) => d.totalTokens);
    const allCosts = chartData.map((d) => d.cost);

    const tokensDomain = calculateDomain(allTokens);
    const costDomain = calculateDomain(allCosts);

    return (
        <>
            <Item variant="outline" className="bg-card rounded-lg" size="sm">
                <ItemMedia>
                    <ChartNoAxesCombined className="size-4" />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>
                        {totalRequests} total requests across {daysWithActivity} active days
                    </ItemTitle>
                    <ItemDescription>
                        Average {avgRequestsPerActiveDay.toFixed(1)} requests per active day • Total cost: $
                        {totalCost.toFixed(2)}
                    </ItemDescription>
                </ItemContent>
            </Item>
            <ChartContainer config={chartConfig} className="mb-4 h-[260px] w-full">
                <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                        left: 0,
                        top: 10,
                        right: 40,
                    }}
                >
                    <CartesianGrid />
                    <XAxis
                        dataKey="dateLabel"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        height={50}
                        interval={0}
                        tick={(props: any) => {
                            const { x, y, payload } = props;
                            const dataPoint = chartData.find((d) => d.dateLabel === payload.value);
                            const isToday = dataPoint?.isToday || false;

                            return (
                                <g transform={`translate(${x},${y})`}>
                                    <text
                                        x={0}
                                        y={0}
                                        dy={8}
                                        textAnchor="end"
                                        transform="rotate(-45)"
                                        className={cn(
                                            isToday ? 'font-bold' : '',
                                            isToday ? 'fill-primary!' : 'fill-muted-foreground',
                                        )}
                                        fontSize={10}
                                    >
                                        {payload.value}
                                    </text>
                                </g>
                            );
                        }}
                    />
                    <YAxis
                        yAxisId="tokens"
                        orientation="left"
                        domain={tokensDomain}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) =>
                            Intl.NumberFormat('en-US', {
                                notation: 'compact',
                            }).format(value)
                        }
                        width={50}
                    />
                    <YAxis
                        yAxisId="cost"
                        orientation="right"
                        domain={costDomain}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) =>
                            Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumSignificantDigits: 2,
                            }).format(value)
                        }
                        hide
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line dataKey="requests" type="linear" stroke="var(--color-requests)" strokeWidth={2} dot />
                    <Line
                        yAxisId="tokens"
                        dataKey="totalTokens"
                        type="linear"
                        stroke="var(--color-totalTokens)"
                        strokeWidth={2}
                        dot
                    />
                    <Line dataKey="cost" type="linear" stroke="var(--color-cost)" strokeWidth={2} dot />
                </LineChart>
            </ChartContainer>
        </>
    );
}

/**
 * Calculate the display date range, limiting to a maximum of 40 days
 *
 * Logic:
 * 1. If range <= 40 days: show full range
 * 2. If range > 40 days: try to show last 40 days before current date (today)
 * 3. If those 40 days aren't all within the period: show first 40 days of the period
 */
function calculateDisplayDateRange(
    periodStartTimestamp: number,
    periodEndTimestamp: number,
): { startDate: Date; endDate: Date } {
    const MAX_DAYS = 40;

    // Convert timestamps to dates and reset to start of day for accurate comparison
    const originalStartDate = new Date(periodStartTimestamp * 1000);
    const originalEndDate = new Date(periodEndTimestamp * 1000);
    originalStartDate.setHours(0, 0, 0, 0);
    originalEndDate.setHours(0, 0, 0, 0);

    // Calculate number of days in the original range (inclusive)
    const daysDifference =
        Math.ceil((originalEndDate.getTime() - originalStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (daysDifference <= MAX_DAYS) {
        // Use the full original range if it's within 40 days
        return { startDate: originalStartDate, endDate: originalEndDate };
    }

    // Range exceeds 40 days, need to show a 40-day window
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Determine the end date for the 40-day window (use today if within period, otherwise use period end)
    const windowEndDate = today <= originalEndDate ? today : originalEndDate;

    // Calculate start date for the 40-day window
    const windowStartDate = new Date(windowEndDate);
    windowStartDate.setDate(windowEndDate.getDate() - (MAX_DAYS - 1));

    // Check if the 40-day window falls entirely within the period
    if (windowStartDate >= originalStartDate) {
        // The 40-day window before current date is all within the range
        return { startDate: windowStartDate, endDate: windowEndDate };
    }

    // The 40-day window extends before the period start
    // Use the first 40 days of the period instead
    const endDate = new Date(originalStartDate);
    endDate.setDate(endDate.getDate() + (MAX_DAYS - 1));

    // Make sure we don't exceed the original end date
    if (endDate > originalEndDate) {
        return { startDate: originalStartDate, endDate: originalEndDate };
    }

    return { startDate: originalStartDate, endDate };
}

/**
 * Calculate domain with padding, cropping to min/max values
 */
function calculateDomain(values: number[]): [number, number] {
    if (values.length === 0 || values.every((v) => v === 0)) {
        return [0, 10]; // Default range for empty data
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = range * 0.1 || 1; // 10% padding or 1 if range is 0

    return [Math.max(0, min - padding), max + padding];
}
