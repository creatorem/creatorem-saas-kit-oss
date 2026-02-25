'use client';

import { Card, CardContent, CardHeader } from '@kit/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@kit/ui/chart';
import { Icon, IconName } from '@kit/ui/icon';
import {
    Dialog,
    DialogAnimatePresenceDiv,
    DialogContent,
    DialogMotionDiv,
    DialogOverlay,
    DialogPortal,
    DialogTrigger,
} from '@kit/ui/motion/dialog';
import { TooltipSc } from '@kit/ui/tooltip';
import { cn } from '@kit/utils';
import { cva } from 'class-variance-authority';
import React, { createContext, useContext } from 'react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import {
    type AggregateMethod,
    Analytics,
    AnalyticsAggregateValueProps,
    type FormatType,
} from '../../../shared/components/analytics/analytics';
import {
    AnalyticsAggregateValue,
    AnalyticsChart,
    AnalyticsChartProps,
    AnalyticsVariation,
    AnalyticsVariationProps,
} from './analytics';

// Context for MetricsCard
interface MetricsCardContextValue {
    data: Array<Record<string, any>>;
    dataKey: string;
    variant?: 'default' | 'wide-chart';
}

const MetricsCardContext = createContext<MetricsCardContextValue | null>(null);

const useMetricsCardContext = () => {
    const context = useContext(MetricsCardContext);
    if (!context) {
        throw new Error('You are calling useMetricsCardContext outside of the MetricsCard component');
    }
    return context;
};

// Root component with context provider
export interface MetricsCardProps {
    className?: string;
    data: Array<Record<string, any>>;
    dataKey: string;
    variant?: 'default' | 'wide-chart';
    children?: React.ReactNode;
}

export function MetricsCard({ className, data, dataKey, variant = 'default', children }: MetricsCardProps) {
    const value: MetricsCardContextValue = {
        data,
        dataKey,
        variant,
    };

    return (
        <Analytics analytics={data}>
            <MetricsCardContext.Provider value={value}>
                <Card className={cn(className, 'py-4')}>{children}</Card>
            </MetricsCardContext.Provider>
        </Analytics>
    );
}

// Header component built on top of CardHeader
export interface MetricsCardHeaderProps {
    className?: string;
    children?: React.ReactNode;
}

export function MetricsCardHeader({ className, children }: MetricsCardHeaderProps) {
    return (
        <CardHeader className={cn('flex flex-row items-center justify-between gap-1', className)}>
            {children}
        </CardHeader>
    );
}

// Title component built on top of CardTitle
export interface MetricsCardTitleProps {
    className?: string;
    icon?: IconName;
    children: React.ReactNode;
}

export function MetricsCardTitle({ className, icon: iconName, children }: MetricsCardTitleProps) {
    return (
        <div className="flex items-center gap-2 truncate text-sm font-medium tracking-tight">
            {iconName && <Icon name={iconName} className={cn('h-4 min-h-4 w-4 min-w-4')} />}
            <span className={cn(className)}>{children}</span>
        </div>
    );
}

// Description component built on top of CardDescription
export interface MetricsCardDescriptionProps {
    className?: string;
    children: React.ReactNode;
}

export function MetricsCardDescription({ className, children }: MetricsCardDescriptionProps) {
    return <p className={cn('text-muted-foreground text-xs', className)}>{children}</p>;
}

// Action component for header actions
export interface MetricsCardActionProps {
    tooltipInfo: string;
    className?: string;
}

export function MetricsCardAction({ tooltipInfo, className }: MetricsCardActionProps) {
    return (
        <TooltipSc content={tooltipInfo}>
            <Icon
                name="BadgeInfo"
                className={cn('text-muted-foreground h-6 w-6 scale-90 cursor-pointer stroke-[1.25]', className)}
            />
        </TooltipSc>
    );
}

// CVA variants for MetricsCardContent
const metricsCardContentVariants = cva('', {
    variants: {
        variant: {
            default: 'flex h-[calc(100%-48px)] flex-col justify-between gap-2',
            'wide-chart': '',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

// Content component built on top of CardContent
export interface MetricsCardContentProps {
    className?: string;
    children?: React.ReactNode;
}

export function MetricsCardContent({ className, children }: MetricsCardContentProps) {
    const { variant } = useMetricsCardContext();

    return <CardContent className={cn(metricsCardContentVariants({ variant }), className)}>{children}</CardContent>;
}

export interface MetricsCardValueProps extends Omit<AnalyticsAggregateValueProps, 'dataKey'> {}

export function MetricsCardValue({ ...props }: MetricsCardValueProps) {
    const { dataKey } = useMetricsCardContext();

    return <AnalyticsAggregateValue {...props} dataKey={dataKey} />;
}

// Chart component
export interface MetricsCardChartProps extends Omit<AnalyticsChartProps, 'dataKey'> {}

export function MetricsCardChart({ ...props }: MetricsCardChartProps) {
    const { dataKey } = useMetricsCardContext();

    return <AnalyticsChart {...props} dataKey={dataKey} />;
}

// CVA variants for MetricsCardVariation text
const metricsCardVariationTextVariants = cva('font-medium', {
    variants: {
        variant: {
            default: 'text-[13px]',
            'wide-chart': 'text-xs',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

// Helper component for metric change display
export interface MetricsCardVariationProps extends Omit<AnalyticsVariationProps, 'data'> {}

export function MetricsCardVariation({ className }: MetricsCardVariationProps) {
    const { dataKey, variant = 'default' } = useMetricsCardContext();

    return (
        <AnalyticsVariation
            data={{ key: dataKey }}
            className={cn(metricsCardVariationTextVariants({ variant }), className)}
        />
    );
}

// MetricsCardDialog component for expandable metrics with details
export interface MetricsCardDialogProps {
    data: Array<Record<string, any>>;
    dataKey: string;
    title: string;
    icon?: IconName;
    tooltipInfo: string;
    chartConfig: ChartConfig;
    chartColor?: string;
    method?: AggregateMethod;
    decimals?: number;
    format?: FormatType;
    className?: string;
    triggerClassName?: string;
    valueProps?: Partial<MetricsCardValueProps>;
    children?: React.ReactNode;
    sinceText?: string;
    contentClassName?: string;
    valueClassName?: string;
    valueUnit?: string;
    variant?: 'default' | 'wide-chart';
    chartHeight?: number;
}

export function MetricsCardDialog({
    data,
    dataKey,
    title,
    icon: iconName,
    tooltipInfo,
    chartConfig,
    chartColor = '#22c55e',
    method = 'sum',
    decimals = 0,
    format = 'number',
    className,
    valueClassName,
    triggerClassName,
    valueProps,
    children,
    sinceText = 'Since last week',
    contentClassName,
    valueUnit,
    variant = 'default',
    chartHeight = 39,
}: MetricsCardDialogProps) {
    return (
        <Dialog>
            <DialogTrigger className={cn('h-full overflow-visible border-none bg-transparent', triggerClassName)}>
                <MetricsCard
                    className={cn(
                        'hover:ring-primary hover:bg-primary/5 h-full ring-transparent transition-colors duration-200 hover:ring-2',
                        className,
                    )}
                    data={data}
                    dataKey={dataKey}
                    variant={variant}
                >
                    <DialogMotionDiv layoutId="header">
                        <MetricsCardHeader>
                            <DialogMotionDiv layoutId="title">
                                <MetricsCardTitle icon={iconName}>{title}</MetricsCardTitle>
                            </DialogMotionDiv>
                            <DialogMotionDiv layoutId="action">
                                <MetricsCardAction tooltipInfo={tooltipInfo} />
                            </DialogMotionDiv>
                        </MetricsCardHeader>
                    </DialogMotionDiv>

                    <MetricsCardContent className={cn(variant === 'wide-chart' && 'pt-0')}>
                        {variant === 'default' ? (
                            <>
                                <div className="flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex flex-col">
                                        <DialogMotionDiv layoutId="value" layout="preserve-aspect">
                                            <span className={cn('text-3xl font-bold', valueClassName)}>
                                                <MetricsCardValue
                                                    method={method}
                                                    decimals={decimals}
                                                    format={format}
                                                    {...valueProps}
                                                />
                                            </span>
                                        </DialogMotionDiv>
                                        {sinceText && (
                                            <DialogMotionDiv layoutId="since-text">
                                                <p className="text-muted-foreground text-xs">{sinceText}</p>
                                            </DialogMotionDiv>
                                        )}
                                    </div>
                                    <DialogMotionDiv
                                        layoutId="chart"
                                        className="pointer-events-none w-[70px] cursor-pointer"
                                    >
                                        <MetricsCardChart config={chartConfig} color={chartColor} />
                                    </DialogMotionDiv>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-5">
                                    <DialogMotionDiv layoutId="details-text" className="text-sm font-semibold">
                                        Details
                                    </DialogMotionDiv>

                                    <DialogMotionDiv layoutId="card-change">
                                        <MetricsCardVariation />
                                    </DialogMotionDiv>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <DialogMotionDiv layoutId="value" layout="preserve-aspect">
                                            <div className={cn('text-2xl font-bold', valueClassName)}>
                                                <MetricsCardValue
                                                    method={method}
                                                    decimals={decimals}
                                                    format={format}
                                                    {...valueProps}
                                                />
                                            </div>
                                        </DialogMotionDiv>
                                    </div>
                                    <DialogMotionDiv layoutId="card-change">
                                        <MetricsCardVariation />
                                    </DialogMotionDiv>
                                </div>
                                <DialogMotionDiv
                                    layoutId="chart"
                                    className="pointer-events-none mt-4 w-full cursor-pointer"
                                >
                                    <MetricsCardChart config={chartConfig} color={chartColor} height={chartHeight} />
                                </DialogMotionDiv>
                            </>
                        )}
                    </MetricsCardContent>
                </MetricsCard>
            </DialogTrigger>

            <DialogPortal>
                <DialogContent
                    className={cn('h-[560px] w-[650px] overflow-visible border-none bg-transparent', contentClassName)}
                >
                    <MetricsCard
                        className="col-span-3 h-full xl:col-span-2"
                        data={data}
                        dataKey={dataKey}
                        variant={variant}
                    >
                        <DialogMotionDiv layoutId="header">
                            <MetricsCardHeader>
                                <DialogMotionDiv layoutId="title">
                                    <MetricsCardTitle icon={iconName}>{title}</MetricsCardTitle>
                                </DialogMotionDiv>
                                <DialogMotionDiv layoutId="action">
                                    <MetricsCardAction tooltipInfo={tooltipInfo} />
                                </DialogMotionDiv>
                            </MetricsCardHeader>
                        </DialogMotionDiv>

                        <MetricsCardContent className={cn('gap-0 px-0', variant === 'wide-chart' && 'pt-0')}>
                            {variant === 'default' ? (
                                <>
                                    <DialogMotionDiv layoutId="chart">
                                        <ChartContainer config={chartConfig} className="w-full" style={{ height: 120 }}>
                                            <LineChart
                                                accessibilityLayer
                                                data={data}
                                                margin={{
                                                    left: 0,
                                                    right: 0,
                                                    top: 5,
                                                    bottom: 5,
                                                }}
                                            >
                                                <defs>
                                                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor={chartColor} stopOpacity={0.8} />
                                                        <stop offset="100%" stopColor={chartColor} stopOpacity={0.1} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid vertical={false} />
                                                <XAxis
                                                    dataKey="date"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={0}
                                                    hide={true}
                                                />
                                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                                <Line
                                                    dataKey={dataKey}
                                                    type="linear"
                                                    stroke={chartColor}
                                                    strokeWidth={2}
                                                    dot={false}
                                                    isAnimationActive={false}
                                                />
                                            </LineChart>
                                        </ChartContainer>
                                    </DialogMotionDiv>

                                    <div className="mt-2 flex w-full items-center justify-between px-8">
                                        <div className="flex items-center gap-1">
                                            <DialogMotionDiv layoutId="value" layout="preserve-aspect">
                                                <span className={cn('text-3xl font-bold', valueClassName)}>
                                                    <MetricsCardValue
                                                        method={method}
                                                        decimals={decimals}
                                                        format={format}
                                                        {...valueProps}
                                                    />
                                                </span>
                                            </DialogMotionDiv>
                                            {valueUnit && (
                                                <p className="text-sm font-semibold duration-(--dialog-duration-40) group-data-[open=false]/dialog:opacity-0 group-data-[open=true]/dialog:opacity-100">
                                                    {valueUnit}
                                                </p>
                                            )}
                                            {sinceText && (
                                                <DialogMotionDiv layoutId="since-text">
                                                    <p className="text-muted-foreground mt-0.5 text-xs">{sinceText}</p>
                                                </DialogMotionDiv>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <DialogMotionDiv layoutId="details-text" className="text-sm font-semibold">
                                                Details
                                            </DialogMotionDiv>
                                            <DialogMotionDiv layoutId="card-change">
                                                <MetricsCardVariation />
                                            </DialogMotionDiv>
                                        </div>
                                    </div>

                                    {children && (
                                        <div className="no-scrollbar relative w-full flex-1 overflow-auto px-6">
                                            <DialogAnimatePresenceDiv
                                                onceOpen
                                                durationFactor={0.5}
                                                delayFactor={0.9}
                                                className="no-scrollbar relative h-full w-full overflow-auto"
                                            >
                                                {children}
                                            </DialogAnimatePresenceDiv>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <DialogMotionDiv layoutId="chart">
                                        <ChartContainer config={chartConfig} className="w-full" style={{ height: 240 }}>
                                            <LineChart
                                                accessibilityLayer
                                                data={data}
                                                margin={{
                                                    left: 0,
                                                    right: 0,
                                                    top: 5,
                                                    bottom: 5,
                                                }}
                                            >
                                                <defs>
                                                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor={chartColor} stopOpacity={0.8} />
                                                        <stop offset="100%" stopColor={chartColor} stopOpacity={0.1} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid vertical={false} />
                                                <XAxis
                                                    dataKey="date"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={0}
                                                    hide={true}
                                                />
                                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                                <Line
                                                    dataKey={dataKey}
                                                    type="linear"
                                                    stroke={chartColor}
                                                    strokeWidth={2}
                                                    dot={false}
                                                    isAnimationActive={false}
                                                />
                                            </LineChart>
                                        </ChartContainer>
                                    </DialogMotionDiv>

                                    <div className="mt-2 flex w-full items-center justify-between px-8">
                                        <div className="flex items-center gap-1">
                                            <DialogMotionDiv layoutId="value" layout="preserve-aspect">
                                                <div className={cn('text-2xl font-bold', valueClassName)}>
                                                    <MetricsCardValue
                                                        method={method}
                                                        decimals={decimals}
                                                        format={format}
                                                        {...valueProps}
                                                    />
                                                </div>
                                            </DialogMotionDiv>
                                        </div>

                                        <DialogMotionDiv layoutId="card-change">
                                            <MetricsCardVariation />
                                        </DialogMotionDiv>
                                    </div>

                                    {children && (
                                        <div className="no-scrollbar relative w-full flex-1 overflow-auto px-6">
                                            <DialogAnimatePresenceDiv
                                                onceOpen
                                                durationFactor={0.5}
                                                delayFactor={0.9}
                                                className="no-scrollbar relative h-full w-full overflow-auto"
                                            >
                                                {children}
                                            </DialogAnimatePresenceDiv>
                                        </div>
                                    )}
                                </>
                            )}
                        </MetricsCardContent>
                    </MetricsCard>
                </DialogContent>
                <DialogOverlay />
            </DialogPortal>
        </Dialog>
    );
}
