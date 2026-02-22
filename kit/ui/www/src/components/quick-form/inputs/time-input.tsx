'use client';

import { TimePicker } from '@kit/ui/time-picker';
import { QuickFormInput } from '@kit/utils/quick-form';
import { useCallback } from 'react';

export const TimeInput: QuickFormInput = ({ field }) => {
    const handleChange = useCallback(
        (date: Date | undefined) => {
            field.onChange(date?.toDateString());
        },
        [field],
    );

    return <TimePicker setDate={handleChange} date={new Date(field.value)} disabled={field.disabled} />;
};
