'use client';

import { Button } from '@kit/ui/button';
import type { DateRange } from '@kit/ui/date-picker';
import { DateRangePicker } from '@kit/ui/date-picker';
import { Icon } from '@kit/ui/icon';
import { cn } from '@kit/utils';
import { useCallback } from 'react';
import {
    PeriodSelectorProps,
    periodOptions,
    useAnalyticsFetcher,
} from '../../../shared/components/analytics/analytics-fetcher';

function PeriodSelector({
    selectedPeriod,
    onPeriodChange,
    onDateRangeChange,
    customDateRange,
    className,
    selectorClassName,
    buttonClassName,
    datePickerClassName,
}: PeriodSelectorProps) {
    const handleCustomDateRangeChange = useCallback(
        (range?: DateRange) => {
            if (range?.from) {
                onDateRangeChange?.(range.from, range?.to);
                onPeriodChange('custom');
            }
        },
        [onDateRangeChange, onPeriodChange],
    );

    return (
        <div className={cn('flex items-center gap-2', className)}>
            {selectedPeriod === 'custom' && (
                <div className="relative">
                    <DateRangePicker
                        dateRange={customDateRange}
                        onDateRangeChange={handleCustomDateRangeChange}
                        className="w-auto"
                        triggerClassName={cn('h-9', datePickerClassName)}
                    />
                </div>
            )}

            <div
                role="tablist"
                aria-orientation="horizontal"
                className={cn(
                    'bg-muted text-muted-foreground inline-flex h-9 items-center justify-center rounded-lg p-1',
                    selectorClassName,
                )}
                tabIndex={0}
            >
                {periodOptions
                    // .filter((option) => (selectedPeriod === 'custom' ? option.value !== 'custom' : true))
                    .map((option) => {
                        // const IconComponent = option.icon;
                        const isSelected = selectedPeriod === option.value;

                        return (
                            <Button
                                key={option.value}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                aria-controls={`period-content-${option.value}`}
                                data-state={isSelected ? 'active' : 'inactive'}
                                variant="ghost"
                                size="sm"
                                onClick={() => onPeriodChange(option.value)}
                                className={cn(
                                    'ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground flex h-7 items-center justify-center gap-2 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-xs',
                                    buttonClassName,
                                )}
                                aria-label={`Select ${option.label} period`}
                            >
                                <Icon name={option.icon} className="h-4 w-4" />
                                {option.label}
                            </Button>
                        );
                    })}
            </div>
        </div>
    );
}

interface AnalyticsFetcherTimeRangeProps
    extends Pick<PeriodSelectorProps, 'className' | 'selectorClassName' | 'buttonClassName' | 'datePickerClassName'> {}

export const AnalyticsFetcherTimeRange = (props: AnalyticsFetcherTimeRangeProps) => {
    const { selectedPeriod, setSelectedPeriod, customDateRange, setCustomDateRange } = useAnalyticsFetcher();

    const handleCustomDateRangeChange = (startDate: Date, endDate?: Date) => {
        setCustomDateRange({ from: startDate, to: endDate });
    };

    return (
        <PeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            onDateRangeChange={handleCustomDateRangeChange}
            customDateRange={customDateRange}
            {...props}
        />
    );
};
