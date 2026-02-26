'use client';

import { PhoneInputBase, PhoneInputFlagMenu, PhoneInputRoot } from '@kit/ui/phone-input';
import { cn } from '@kit/utils';
import { QuickFormInput, quickFormInputVariants } from '@kit/utils/quick-form';
import React, { useCallback } from 'react';

export const PhoneInput: QuickFormInput<{
    className?: string;
}> = ({ field: { onChange, value, ...field }, className, variant }) => {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);
        },
        [onChange],
    );

    return (
        <PhoneInputRoot value={value || ''} onPhoneInputChange={handleChange} className={className}>
            <PhoneInputFlagMenu className="bg-muted/50 focus-visible:bg-background" />
            <PhoneInputBase
                {...field}
                className={cn(
                    quickFormInputVariants({ variant }),
                    value ? 'bg-muted/50 focus-visible:bg-background' : '',
                )}
            />
        </PhoneInputRoot>
    );
};
