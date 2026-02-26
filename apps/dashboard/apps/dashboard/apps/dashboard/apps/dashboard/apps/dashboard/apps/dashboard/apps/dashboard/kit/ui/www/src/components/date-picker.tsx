'use client';

import { Icon } from '@kit/ui/icon';
import { cn } from '@kit/utils';
import { addDays, format } from 'date-fns';
import React from 'react';
import { type DateRange } from 'react-day-picker';
import { Button } from '../shadcn/button';
import { Calendar } from '../shadcn/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../shadcn/popover';

const defaultPresets = [
    { value: 0, label: 'Today' },
    { value: 1, label: 'Tomorrow' },
    { value: 3, label: 'In 3 days' },
    { value: 7, label: 'In a week' },
];

type DatePickerProps = React.ComponentPropsWithoutRef<typeof Button> & {
    date?: Date;
    onDateChange?: (date?: Date) => void;
    placeholder?: string;
    presets?: { value: number; label: string }[];
};
function DatePicker({
    date,
    onDateChange,
    placeholder = 'Pick a date',
    presets = defaultPresets,
    className,
    variant,
    ...other
}: DatePickerProps): React.JSX.Element {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={variant || 'outline'}
                    className={cn(
                        'justify-start text-left font-normal whitespace-nowrap',
                        !date && 'text-muted-foreground',
                        className,
                    )}
                    {...other}
                >
                    <Icon name="Calendar" className="mr-2 size-4 shrink-0" />
                    {date ? format(date, 'PPP') : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="center" className="flex w-auto flex-row gap-2 divide-x p-2">
                <ul className="w-full list-none space-y-1">
                    {presets.map((preset) => (
                        <li key={preset.value}>
                            <Button
                                aria-label={preset.label}
                                type="button"
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => {
                                    onDateChange?.(addDays(new Date(), preset.value));
                                }}
                            >
                                {preset.label}
                            </Button>
                        </li>
                    ))}
                </ul>
                <Calendar
                    lang="en"
                    mode="single"
                    selected={date}
                    defaultMonth={date}
                    onSelect={(e) => {
                        onDateChange?.(e);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
DatePicker.displayName = 'DatePicker';

type DateRangePickerProps = React.HTMLAttributes<HTMLDivElement> & {
    dateRange?: DateRange;
    onDateRangeChange?: (range?: DateRange) => void;
    disabled?: boolean;
    triggerClassName?: string;
};
function DateRangePicker({
    dateRange,
    onDateRangeChange,
    disabled,
    className,
    triggerClassName,
    ...other
}: DateRangePickerProps): React.JSX.Element {
    return (
        <div className={cn('grid gap-2', className)} {...other}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        aria-label="Date range picker"
                        id="date"
                        variant={'outline'}
                        className={cn(
                            '[&[data-state=open]]:ring-ring no-scrollbar w-[200px] justify-start overflow-x-auto text-left font-normal [&[data-state=open]]:ring-2 [&[data-state=open]]:ring-offset-2',
                            !dateRange && 'text-muted-foreground',
                            triggerClassName,
                        )}
                        disabled={disabled}
                    >
                        <Icon name="Calendar" className="size-4 shrink-0" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                                </>
                            ) : (
                                format(dateRange.from, 'LLL dd, y')
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0"
                    align="end"
                    closeIcon={false}
                    collisionPadding={10}
                    sideOffset={10}
                >
                    <Calendar
                        lang="en"
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(d) => {
                            onDateRangeChange?.(d);
                        }}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
DateRangePicker.displayName = 'DateRangePicker';

export { DatePicker, type DateRange, DateRangePicker };
