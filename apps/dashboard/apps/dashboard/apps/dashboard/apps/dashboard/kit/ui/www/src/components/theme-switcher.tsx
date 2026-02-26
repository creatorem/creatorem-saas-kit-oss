'use client';

import { Icon, IconName } from '@kit/ui/icon';
import { cn } from '@kit/utils';
import { useTheme } from 'next-themes';
import React, { useCallback, useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../shadcn/tooltip';

const THEMES: {
    value: string;
    icon: IconName;
    label: string;
}[] = [
    {
        value: 'system',
        icon: 'Laptop',
        label: 'System',
    },
    {
        value: 'light',
        icon: 'Sun',
        label: 'Light',
    },
    {
        value: 'dark',
        icon: 'Moon',
        label: 'Dark',
    },
];

export const ThemeSwitcher: React.FC<{ className?: string }> = ({ className }) => {
    const { setTheme, theme } = useTheme();
    const themeValue = theme || 'system';

    const handleChangeTheme = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>): void => {
            setTheme(e.target.value);
        },
        [setTheme],
    );

    const themeOptions = useMemo(
        () =>
            THEMES.map(({ value, icon: iconName, label }) => (
                <span key={value} className="h-full">
                    <input
                        className="peer sr-only"
                        type="radio"
                        id={`theme-switch-${value}`}
                        value={value}
                        checked={themeValue === value}
                        onChange={handleChangeTheme}
                    />
                    <label
                        htmlFor={`theme-switch-${value}`}
                        className="text-muted-foreground peer-checked:bg-accent peer-checked:text-foreground flex size-6 cursor-pointer items-center justify-center rounded-full"
                        aria-label={`${label} theme`}
                    >
                        <Tooltip delayDuration={600}>
                            <TooltipTrigger asChild>
                                <Icon name={iconName} className="size-4 shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent>{label}</TooltipContent>
                        </Tooltip>
                    </label>
                </span>
            )),
        [themeValue, handleChangeTheme],
    );

    return <div className={cn('bg-background flex w-fit rounded-full border p-0.5', className)}>{themeOptions}</div>;
};
