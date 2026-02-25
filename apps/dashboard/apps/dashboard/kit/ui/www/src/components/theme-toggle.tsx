'use client';

import { Icon } from '@kit/ui/icon';
import { cn } from '@kit/utils';
import { useTheme } from 'next-themes';
import React, { useCallback } from 'react';
import { Button } from '../shadcn/button';

interface ThemeToggleProps
    extends Omit<React.ComponentPropsWithoutRef<typeof Button>, 'variant' | 'size' | 'onClick' | 'aria-label'> {
    variant?: 'outline' | 'ghost' | 'default';
}

export function ThemeToggle({ className, ...props }: ThemeToggleProps): React.JSX.Element {
    const { resolvedTheme, setTheme } = useTheme();

    const handleToggleTheme = useCallback((): void => {
        setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
    }, [resolvedTheme, setTheme]);

    return (
        <Button
            data-slot="theme-toggle"
            variant="ghost"
            size="icon"
            className={cn('bg-background', className)}
            aria-label="Toggle theme"
            onClick={handleToggleTheme}
            {...props}
        >
            <Icon
                name="Sun"
                className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
                aria-hidden="true"
            />
            <Icon
                name="Moon"
                className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
                aria-hidden="true"
            />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
