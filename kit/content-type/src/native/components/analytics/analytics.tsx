// import { ChartConfig, ChartContainer } from '@kit/ui/chart';
import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon } from '@kit/native-ui/icon';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import { Group, LinearGradient, Path, vec } from '@shopify/react-native-skia';
import { View } from 'react-native';
import { CartesianChart, type ChartBounds, type PointsArray, useAreaPath, useLinePath } from 'victory-native';
import {
    AnalyticsAggregateValueProps,
    AnalyticsAggregateValue as SharedAnalyticsAggregateValue,
    useAnalytics,
    useAnalyticsMinMaxDomain,
    useAnalyticsVariation,
} from '../../../shared/components/analytics/analytics';

export function AnalyticsAggregateValue({
    className,
    ...props
}: AnalyticsAggregateValueProps & { className?: string }) {
    return (
        <Text className={cn('text-2xl font-bold', className)}>
            <SharedAnalyticsAggregateValue {...props} />
        </Text>
    );
}

// Chart component
export interface AnalyticsChartProps {
    dataKey: string;
    height?: number;
    color?: string;
}

export function AnalyticsChart({ dataKey, height = 39, color = '#a855f7' }: AnalyticsChartProps) {
    const { analytics } = useAnalytics();
    console.log({ analytics });
    const colors = useThemeColors();
    const domain = useAnalyticsMinMaxDomain({ dataKey });
    if (!domain) return null;
    const [domainMin, domainMax] = domain;

    console.log({ dataKey });

    return (
        <View style={{ height }}>
            <CartesianChart
                // chartPressState={state}
                data={analytics}
                // @ts-expect-error
                xKey={'date'}
                xAxis={{
                    // font,
                    formatXLabel: (ms) => (new Date(ms), 'MM/yy'),
                    labelOffset: 6,
                    // lineColor: colors['--color-muted'],
                    // labelColor: colors['--color-foreground'],
                }}
                // @ts-expect-error
                yKeys={[dataKey]}
                // chartPressState={[firstTouch, secondTouch]}
                axisOptions={{
                    // font,
                    tickCount: 4,
                    labelOffset: { x: 6, y: 8 },
                    labelPosition: { x: 'outset', y: 'inset' },
                    axisSide: { x: 'bottom', y: 'left' },
                    formatYLabel: (v) => `$${v}`,
                    // lineColor: colors['--color-muted-foreground'],
                    // labelColor: colors['--color-foreground'],
                }}
                domain={{
                    y: [domainMin, domainMax],
                }}
            >
                {({ chartBounds, points }) => (
                    <>
                        <StockArea
                            color={color}
                            // @ts-expect-error
                            points={points[dataKey]}
                            {...chartBounds}
                        />
                    </>
                )}
            </CartesianChart>
        </View>
    );
}

const StockArea = ({
    color,
    points,
    top,
    bottom,
}: {
    color: string;
    points: PointsArray;
} & ChartBounds) => {
    const { path: areaPath } = useAreaPath(points, bottom);
    const { path: linePath } = useLinePath(points);

    return (
        <Group>
            <Path path={areaPath} style="fill">
                <LinearGradient start={vec(0, 0)} end={vec(top, bottom)} colors={[color, `${color}33`]} />
            </Path>
            <Path path={linePath} style="stroke" strokeWidth={2} color={color} />
        </Group>
    );
};
// Helper component for metric change display
export interface AnalyticsVariationProps {
    data: Parameters<typeof useAnalyticsVariation>[0];
    className?: string;
}

export function AnalyticsVariation({ data, className }: AnalyticsVariationProps) {
    const variation = useAnalyticsVariation(data);
    const colors = useThemeColors();
    if (!variation) return null;
    const { isIncrease, isDecrease, percentageChange } = variation;

    return (
        <View className={cn('flex flex-row items-center gap-1 rounded-xl', className)}>
            <Icon
                name={isDecrease ? 'TrendingDown' : isIncrease ? 'TrendingUp' : 'EqualApproximately'}
                size={16}
                color={
                    isIncrease
                        ? colors.isDark
                            ? '#00d492' // emerald-400
                            : '#00bc7d' // emerald-500
                        : isDecrease
                          ? colors.isDark
                              ? '#ff6467' // red-400
                              : '#fb2c36' // red-500
                          : colors['--color-muted-foreground']
                }
            />
            <Text
                style={{
                    color: isIncrease
                        ? colors.isDark
                            ? '#00d492' // emerald-400
                            : '#00bc7d' // emerald-500
                        : isDecrease
                          ? colors.isDark
                              ? '#ff6467' // red-400
                              : '#fb2c36' // red-500
                          : colors['--color-muted-foreground'],
                    fontSize: 12,
                    fontWeight: 500,
                }}
            >
                {isIncrease ? '+' : isDecrease ? '-' : ''}
                {Math.abs(percentageChange).toFixed(2)}%
            </Text>
        </View>
    );
}
