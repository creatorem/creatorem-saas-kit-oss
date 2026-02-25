'use client';

import { ThemeRadioCard } from '@kit/ui/theme-radio-card';
import { QuickFormInput } from '@kit/utils/quick-form';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export const ThemeInput: QuickFormInput = ({ field: { onChange, value, ...field } }) => {
    const { setTheme } = useTheme();

    useEffect(() => {
        setTheme(value);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return <ThemeRadioCard onValueChange={onChange} value={value} {...field} />;
};
