import React, { createContext, useContext } from 'react';

interface AnalyticsContextType<A extends Record<string, unknown>> {
    analytics: A[];
}

const AnalyticsContext = createContext<AnalyticsContextType<Record<string, unknown>>>({
    analytics: [],
});

export const useAnalytics = <A extends Record<string, unknown>>() => {
    const ctx = useContext(AnalyticsContext) as unknown as AnalyticsContextType<A>;
    if (!ctx) {
        throw new Error('useAnalytics must be used within a AnalyticsProvider');
    }
    return ctx;
};

interface AnalyticsProps<A extends Record<string, unknown>> {
    analytics: A[];
    children: React.ReactNode;
}

export const Analytics = <A extends Record<string, unknown>>({ analytics, children }: AnalyticsProps<A>) => {
    return (
        <AnalyticsContext.Provider
            value={{
                analytics,
            }}
        >
            {children}
        </AnalyticsContext.Provider>
    );
};

export type AggregateMethod = 'sum' | 'average' | 'last' | 'first' | 'min' | 'max' | 'count';
export type ProjectionMethod =
    | {
          type: 'projection';
          /** Number of days to project into the future */
          period: ProjectionPeriod | number;
      }
    | AggregateMethod;
export type FormatType = 'number' | 'currency' | 'percentage' | 'compact' | 'custom';

/**
 * Helper function to parse a value to number
 * Handles strings that contain valid numeric values
 */
export function parseNumericValue(value: any): number | null {
    // Already a number
    if (typeof value === 'number') {
        return Number.isNaN(value) ? null : value;
    }

    // Try to parse string to number
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') return null;

        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
}

type ProjectionPeriod = 'day' | 'week' | 'month';

/**
 * Calculate projection based on linear regression of historical data
 * Uses least squares method to fit a trend line and project future values
 */
export function calculateProjection(
    data: Array<Record<string, any>>,
    dataKey: string,
    period: ProjectionPeriod | number,
): number {
    if (data.length < 2) return 0;

    // Filter data with valid createdAt and dataKey values
    const points: Array<{ timestamp: number; value: number }> = [];

    for (const item of data) {
        if (!item.createdAt || typeof item.createdAt !== 'string') continue;

        const timestamp = new Date(item.createdAt).getTime();
        if (Number.isNaN(timestamp)) continue;

        const value = parseNumericValue(item[dataKey]);
        if (value === null) continue;

        points.push({ timestamp, value });
    }

    if (points.length < 2) return 0;

    // Sort by timestamp
    points.sort((a, b) => a.timestamp - b.timestamp);

    // Calculate linear regression (y = mx + b)
    const n = points.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (const point of points) {
        sumX += point.timestamp;
        sumY += point.value;
        sumXY += point.timestamp * point.value;
        sumXX += point.timestamp * point.timestamp;
    }

    // Calculate slope (m) and intercept (b)
    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    // Calculate the projection timestamp based on the period
    const lastTimestamp = points[points.length - 1]!.timestamp;
    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    let projectionTimestamp: number;
    switch (period) {
        case 'day':
            projectionTimestamp = lastTimestamp + millisecondsPerDay;
            break;
        case 'week':
            projectionTimestamp = lastTimestamp + 7 * millisecondsPerDay;
            break;
        case 'month':
            projectionTimestamp = lastTimestamp + 30 * millisecondsPerDay;
            break;
        default:
            projectionTimestamp = (period as number) * millisecondsPerDay;
    }

    // Calculate projected value using the trend line equation
    const projectedValue = m * projectionTimestamp + b;

    // Ensure non-negative projection (can't have negative counts/amounts)
    return Math.max(0, projectedValue);
}

export function aggregateValue(
    data: Array<Record<string, any>>,
    dataKey: string,
    method: AggregateMethod,
    format?: FormatType,
): number {
    if (data.length === 0) return 0;

    if (method === 'count') {
        return data.length;
    }

    // Parse values to numbers, handling both numeric and string numeric values
    const values = data.map((item) => parseNumericValue(item[dataKey])).filter((val): val is number => val !== null);

    if (values.length === 0) return 0;

    let result = 0;

    switch (method) {
        case 'sum':
            result = values.reduce((acc, val) => acc + val, 0);
            break;
        case 'average':
            result = values.reduce((acc, val) => acc + val, 0) / values.length;
            break;
        case 'last':
            result = values[values.length - 1] ?? 0;
            break;
        case 'first':
            result = values[0] ?? 0;
            break;
        case 'min':
            result = Math.min(...values);
            break;
        case 'max':
            result = Math.max(...values);
            break;
        default:
            result = 0;
    }

    // Apply format-specific transformations if needed
    if (format === 'percentage') {
        result = result * 100;
    }

    return result;
}

// Format value function to handle different formatting types
interface FormatValueOptions {
    value: number;
    format: FormatType;
    decimals: number;
    locale: string;
    currency?: string;
    separator: string;
    prefix: string;
    suffix: string;
    showCurrency?: boolean;
}

function formatValue({
    value,
    format,
    decimals,
    locale,
    currency,
    separator,
    prefix,
    suffix,
    showCurrency = false,
}: FormatValueOptions): string {
    let formattedValue = '';

    // Get currency symbol if needed
    const getCurrencySymbol = (curr: string, loc: string) => {
        try {
            const formatter = new Intl.NumberFormat(loc, {
                style: 'currency',
                currency: curr,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });
            // Extract just the symbol by formatting 0
            const parts = formatter.formatToParts(0);
            const symbolPart = parts.find((part) => part.type === 'currency');
            return symbolPart?.value || curr;
        } catch {
            return curr;
        }
    };

    const currencySymbol = showCurrency && currency ? getCurrencySymbol(currency, locale) : '';

    switch (format) {
        case 'number': {
            // Format with locale-specific number formatting and custom separator
            const parts = value.toFixed(decimals).split('.');
            const integerPart = parts[0]?.replace(/\B(?=(\d{3})+(?!\d))/g, separator) || '0';
            const decimalPart = parts[1] ? `.${parts[1]}` : '';
            formattedValue = `${prefix}${currencySymbol}${integerPart}${decimalPart}${suffix}`;
            break;
        }
        case 'currency': {
            // Format as currency using Intl.NumberFormat (this format type includes currency by default)
            const currencyFormatter = new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency || 'USD',
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });
            formattedValue = `${prefix}${currencyFormatter.format(value)}${suffix}`;
            break;
        }
        case 'percentage': {
            // Format as percentage (value already multiplied by 100 in aggregateValue)
            const parts = value.toFixed(decimals).split('.');
            const integerPart = parts[0]?.replace(/\B(?=(\d{3})+(?!\d))/g, separator) || '0';
            const decimalPart = parts[1] ? `.${parts[1]}` : '';
            formattedValue = `${prefix}${integerPart}${decimalPart}%${suffix}`;
            break;
        }
        case 'compact': {
            // Format as compact notation (1K, 1M, 1B, etc.)
            const compactFormatter = new Intl.NumberFormat(locale, {
                notation: 'compact',
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });
            const compactValue = compactFormatter.format(value);
            formattedValue = `${prefix}${currencySymbol}${compactValue}${suffix}`;
            break;
        }
        case 'custom': {
            // Fallback to simple toFixed
            formattedValue = `${prefix}${currencySymbol}${value.toFixed(decimals)}${suffix}`;
            break;
        }
        default: {
            formattedValue = `${prefix}${currencySymbol}${value.toFixed(decimals)}${suffix}`;
        }
    }

    return formattedValue;
}

export interface AnalyticsAggregateValueProps {
    dataKey: string;
    method?: ProjectionMethod;
    customValue?: number;
    decimals?: number;
    format?: FormatType;
    locale?: string;
    currency?: string;
    showCurrency?: boolean;
    separator?: string;
    prefix?: string;
    suffix?: string;
    formatter?: (value: number) => string;
}

export function AnalyticsAggregateValue({
    dataKey,
    customValue,
    method = 'sum',
    decimals = 0,
    format = 'number',
    locale = 'en-US',
    currency = 'USD',
    showCurrency = false,
    separator = ' ',
    prefix = '',
    suffix = '',
    formatter,
}: AnalyticsAggregateValueProps) {
    const { analytics } = useAnalytics();

    // Calculate the value based on method type
    let value: number;

    if (customValue !== undefined) {
        value = customValue;
    } else if (typeof method === 'object' && method.type === 'projection') {
        // Calculate projection
        value = calculateProjection(analytics, dataKey, method.period);
    } else {
        // Standard aggregation
        value = aggregateValue(analytics, dataKey, method as AggregateMethod, format);
    }

    // If custom formatter is provided, use it
    if (formatter) {
        return <>{formatter(value)}</>;
    }

    // Format the value using the formatValue function
    const formattedValue = formatValue({
        value,
        format,
        decimals,
        locale,
        currency,
        showCurrency,
        separator,
        prefix,
        suffix,
    });

    return <>{formattedValue}</>;
}

// used in AnalyticsChart components
export const useAnalyticsMinMaxDomain = ({ dataKey }: { dataKey: string }) => {
    const { analytics } = useAnalytics();

    if (analytics.length === 0) return null;

    // Calculate min and max values for proper scaling, parsing string numeric values
    const values = analytics
        .map((item) => parseNumericValue(item[dataKey]))
        .filter((val): val is number => val !== null);

    if (values.length === 0) return null;

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Add padding to prevent the line from touching the edges
    const padding = (maxValue - minValue) * 0.1; // 10% padding
    const domainMin = Math.max(0, minValue - padding);
    const domainMax = maxValue + padding;

    return [domainMin, domainMax] as [number, number];
};

// used in AnalyticsVariation
export const useAnalyticsVariation = (
    data:
        | {
              key: string;
          }
        | {
              method: 'count';
          },
) => {
    const { analytics } = useAnalytics();

    if (analytics.length < 2) return null;

    let firstValue: number | null = null;
    let lastValue: number | null = null;

    if ('method' in data && data.method === 'count') {
        // Count-based variation using createdAt dates
        // Group items by date and count occurrences per day
        const dateGroups = new Map<string, number>();

        for (const item of analytics) {
            if (!item.createdAt || typeof item.createdAt !== 'string') {
                continue;
            }

            // Extract date (YYYY-MM-DD) from ISO string or date string
            const dateStr = item.createdAt.split(' ')[0];
            if (!dateStr) continue;

            dateGroups.set(dateStr, (dateGroups.get(dateStr) || 0) + 1);
        }

        if (dateGroups.size < 2) return null;

        // Sort dates chronologically (oldest to newest)
        const sortedDates = Array.from(dateGroups.keys()).sort((a, b) => {
            return new Date(a).getTime() - new Date(b).getTime();
        });

        // First date is the oldest, last date is the most recent
        const oldestDate = sortedDates[0];
        const newestDate = sortedDates[sortedDates.length - 1];

        if (!oldestDate || !newestDate) return null;

        // firstValue = count on the oldest day
        // lastValue = count on the newest day
        firstValue = dateGroups.get(oldestDate) || 0;
        lastValue = dateGroups.get(newestDate) || 0;
    } else if ('key' in data) {
        // Key-based variation (original behavior)
        const dataKey = data.key;
        const rawLastValue = analytics[analytics.length - 1]?.[dataKey];
        const rawFirstValue = analytics[0]?.[dataKey];

        // Parse values to numbers, handling both numeric and string numeric values
        lastValue = parseNumericValue(rawLastValue);
        firstValue = parseNumericValue(rawFirstValue);
    }

    // Check if both values are valid numbers after parsing
    if (lastValue === null || firstValue === null) {
        return null;
    }

    const isIncrease = lastValue > firstValue;
    const isDecrease = lastValue < firstValue;

    // Calculate percentage change
    const percentageChange = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    return {
        isIncrease,
        isDecrease,
        percentageChange,
    };
};
