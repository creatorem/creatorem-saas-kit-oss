// import { Button } from '@kit/native-ui/button';
import { ActionSheet, ActionSheetContent, ActionSheetTrigger } from '@kit/native-ui/action-sheet';
import { Button } from '@kit/native-ui/button';
import { Icon } from '@kit/native-ui/icon';
import { TouchableOpacity } from '@kit/native-ui/react-native';
import { Text } from '@kit/native-ui/text';
import { cn } from '@kit/utils';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import {
    PeriodSelectorProps,
    periodOptions,
    useAnalyticsFetcher,
} from '../../../shared/components/analytics/analytics-fetcher';

type DateRange = {
    from: Date | undefined;
    to?: Date | undefined;
};

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
    const [open, setOpen] = useState<boolean>(false);
    const [tempStartDate, setTempStartDate] = useState<Date | undefined>(customDateRange?.from || new Date());
    const [tempEndDate, setTempEndDate] = useState<Date | undefined>(customDateRange?.to || new Date());

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
        <ActionSheet>
            <ActionSheetTrigger className="mr-auto" asChild>
                <Button variant="outline">
                    <Icon name="Calendar" size={18} />
                    {selectedPeriod === 'custom' ? (
                        <>
                            {tempStartDate && <Text>From {format(tempStartDate, 'dd/MM')}</Text>}
                            {tempEndDate && <Text>to {format(tempEndDate, 'dd/MM')}</Text>}
                        </>
                    ) : (
                        <Text>{periodOptions.find((p) => p.value === selectedPeriod)?.label || 'Custom'}</Text>
                    )}
                </Button>
            </ActionSheetTrigger>

            <ActionSheetContent>
                <View className="px-4 pt-2 pb-8">
                    <View className="flex gap-1">
                        {periodOptions.map((option) => {
                            const isSelected = selectedPeriod === option.value;

                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => {
                                        onPeriodChange(option.value);
                                        if (option.value !== 'custom') {
                                            setOpen(false);
                                        }
                                    }}
                                    aria-label={`Select ${option.label} period`}
                                    className={cn(
                                        'flex flex-row items-center gap-2 px-2 py-1',
                                        isSelected ? 'bg-accent rounded-md' : '',
                                    )}
                                >
                                    <Icon name={option.icon} size={16} />
                                    <Text>{option.label}</Text>
                                    {isSelected && <Icon name="Check" size={16} className="ml-auto" />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {selectedPeriod === 'custom' && (
                        <View className="mt-4 flex flex-row items-center gap-2">
                            <Text>From</Text>
                            <DateTimePicker
                                value={tempStartDate || new Date()}
                                mode="date"
                                maximumDate={tempEndDate}
                                display="default"
                                onChange={(event: any, selectedDate?: Date) => {
                                    if (selectedDate) {
                                        handleCustomDateRangeChange({
                                            from: selectedDate,
                                            to: tempEndDate,
                                        });
                                        setTempStartDate(selectedDate);
                                    }
                                }}
                            />

                            <Text>to</Text>
                            <DateTimePicker
                                value={tempEndDate || new Date()}
                                mode="date"
                                minimumDate={tempStartDate}
                                display="default"
                                onChange={(event: any, selectedDate?: Date) => {
                                    if (selectedDate) {
                                        handleCustomDateRangeChange({
                                            from: tempStartDate,
                                            to: selectedDate,
                                        });
                                        setTempEndDate(selectedDate);
                                    }
                                }}
                            />
                        </View>
                    )}
                </View>
            </ActionSheetContent>
        </ActionSheet>
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
