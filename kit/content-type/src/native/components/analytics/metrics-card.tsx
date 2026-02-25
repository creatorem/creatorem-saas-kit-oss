import { Icon, IconName } from '@kit/native-ui/icon';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import { cva } from 'class-variance-authority';
import React, { createContext, useContext } from 'react';
import { View } from 'react-native';
import { Analytics, AnalyticsAggregateValueProps } from '../../../shared/components/analytics/analytics';
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
                <View
                    className={cn(
                        'dark:bg-card/40 bg-accent/40 border-border flex-1 rounded-2xl border px-4 py-3',
                        className,
                    )}
                >
                    {children}
                </View>
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
    return <View className={cn('flex flex-col items-start justify-between gap-2', className)}>{children}</View>;
}

// Title component built on top of CardTitle
export interface MetricsCardTitleProps {
    className?: string;
    icon?: IconName;
    children: React.ReactNode;
}

export function MetricsCardTitle({ className, icon: iconName, children }: MetricsCardTitleProps) {
    return (
        <View className="flex flex-row items-center gap-2 truncate text-sm font-semibold tracking-tight">
            {iconName && <Icon name={iconName} size={16} />}
            <Text className={cn(className)}>{children}</Text>
        </View>
    );
}

// Description component built on top of CardDescription
export interface MetricsCardDescriptionProps {
    className?: string;
    children: React.ReactNode;
}

export function MetricsCardDescription({ className, children }: MetricsCardDescriptionProps) {
    return <Text className={cn('text-muted-foreground text-xs', className)}>{children}</Text>;
}

// Action component for header actions
export interface MetricsCardActionProps {
    tooltipInfo: string;
    className?: string;
}

// CVA variants for MetricsCardContent
// const metricsCardContentVariants = cva('', {
//     variants: {
//         variant: {
//             default: 'flex h-[calc(100%-48px)] flex-col justify-between gap-2',
//             'wide-chart': '',
//         },
//     },
//     defaultVariants: {
//         variant: 'default',
//     },
// });

// Content component built on top of CardContent
export interface MetricsCardContentProps {
    className?: string;
    children?: React.ReactNode;
}

export function MetricsCardContent({ className, children }: MetricsCardContentProps) {
    const { variant } = useMetricsCardContext();

    // return <View className={cn(metricsCardContentVariants({ variant }), className)}>{children}</View>;
    return <View className={cn('mt-1 flex flex-col justify-between gap-2', className)}>{children}</View>;
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
const metricsCardVariationTextVariants = cva('bg-background mr-auto rounded-2xl px-2 py-1 font-medium', {
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
