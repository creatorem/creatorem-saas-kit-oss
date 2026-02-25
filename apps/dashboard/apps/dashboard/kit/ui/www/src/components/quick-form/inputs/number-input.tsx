'use client';

import { DragWheelControls, NumberInputBase, NumberInputRoot } from '@kit/ui/number-input';
import { cn } from '@kit/utils';
import { QuickFormInput } from '@kit/utils/quick-form';
import { useCallback } from 'react';

export const NumberInput: QuickFormInput<{
    step?: number;
    min?: number;
    max?: number;
}> = ({ field: { onChange, value, ...field } }) => {
    const handleChange = useCallback(
        (v: number | '') => {
            onChange(typeof v === 'number' ? v : 0);
        },
        [onChange],
    );

    return (
        <NumberInputRoot value={value} onValueChange={handleChange} asChild>
            <DragWheelControls className="w-24">
                <NumberInputBase {...field} className={cn(value ? 'bg-muted/50 focus-visible:bg-background' : '')} />
            </DragWheelControls>
        </NumberInputRoot>
    );
};
