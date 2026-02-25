'use client';

import { ChartConfig, ChartContainer } from '@kit/ui/chart';
import { Icon } from '@kit/ui/icon';
import { cn } from '@kit/utils';
import { Line, LineChart, XAxis, YAxis } from 'recharts';
import {
    Analytics,
    AnalyticsAggregateValueProps,
    AnalyticsAggregateValue as SharedAnalyticsAggregateValue,
    useAnalytics,
    useAnalyticsMinMaxDomain,
    useAnalyticsVariation,
} from '../../../shared/components/analytics/analytics';

export { Analytics };
export type { AnalyticsAggregateValueProps };

export function AnalyticsAggregateValue({
    className,
    ...props
}: AnalyticsAggregateValueProps & { className?: string }) {
    return (
        <span className={cn(className)}>
            <SharedAnalyticsAggregateValue {...props} />
        </span>
    );
}

// Chart component
export interface AnalyticsChartProps {
    dataKey: string;
    height?: number;
    className?: string;
    config: ChartConfig;
    color?: string;
}

export function AnalyticsChart({ dataKey, height = 39, className, config, color = '#a855f7' }: AnalyticsChartProps) {
    const { analytics } = useAnalytics();
    const domain = useAnalyticsMinMaxDomain({ dataKey });
    if (!domain) return null;
    const [domainMin, domainMax] = domain;

    return (
        <ChartContainer
            config={
                config || {
                    value: { color: 'blue' },
                    xAxis: {
                        label: 'Date',
                    },
                    yAxis: {
                        label: 'Value',
                    },
                }
            }
            className={cn('w-full', className)}
            style={{ height }}
        >
            <LineChart
                accessibilityLayer
                data={analytics}
                margin={{
                    left: 0,
                    right: 0,
                    top: 5,
                    bottom: 5,
                }}
            >
                <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={0} hide={true} />
                <YAxis domain={[domainMin, domainMax]} tickLine={false} axisLine={false} tickMargin={0} hide={true} />
                <Line dataKey={dataKey} type="linear" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
        </ChartContainer>
    );
}

// Helper component for metric change display
export interface AnalyticsVariationProps {
    data: Parameters<typeof useAnalyticsVariation>[0];
    className?: string;
}

export function AnalyticsVariation({ data, className }: AnalyticsVariationProps) {
    const variation = useAnalyticsVariation(data);
    if (!variation) return null;
    const { isIncrease, isDecrease, percentageChange } = variation;

    return (
        <div
            className={cn(
                'flex items-center gap-1 rounded-xl',
                isIncrease && 'text-emerald-500 dark:text-emerald-400',
                isDecrease && 'text-red-500 dark:text-red-400',
                !isIncrease && !isDecrease && 'text-muted-foreground',
                className,
            )}
        >
            <Icon
                name={isDecrease ? 'TrendingDown' : isIncrease ? 'TrendingUp' : 'EqualApproximately'}
                className="size-3.5"
            />
            <p className={cn('text-xs font-medium')}>
                {isIncrease ? '+' : isDecrease ? '-' : ''}
                {Math.abs(percentageChange).toFixed(2)}%
            </p>
        </div>
    );
}
