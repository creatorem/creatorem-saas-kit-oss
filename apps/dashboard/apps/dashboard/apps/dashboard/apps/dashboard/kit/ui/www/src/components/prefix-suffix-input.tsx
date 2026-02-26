import { cn } from '@kit/utils';
import React from 'react';

interface PrefixSuffixInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
    prefix?: React.ReactElement | null;
    prefixClassName?: string;
    suffix?: React.ReactElement | null;
    suffixClassName?: string;
    containerClassName?: string;
}
const PrefixSuffixInput = React.forwardRef<HTMLInputElement, PrefixSuffixInputProps>(
    ({ className, prefix, suffix, containerClassName, prefixClassName, suffixClassName, ...other }, ref) => (
        <div className={cn('relative inline-block h-10 w-full', containerClassName)}>
            {prefix && (
                // by default the prefix is not interactive (display purposes only)
                <span
                    className={cn(
                        'text-muted-foreground pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2',
                        prefixClassName,
                    )}
                >
                    {prefix}
                </span>
            )}
            <input
                ref={ref}
                className={cn(
                    'border-input placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background flex h-10 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
                    prefix && suffix ? 'px-10' : prefix ? 'pr-4 pl-10' : suffix ? 'pr-10 pl-4' : '',
                    className,
                )}
                {...other}
            />
            {suffix && (
                // by default the suffix is interactive
                <span
                    className={cn(
                        'text-muted-foreground pointer-events-auto absolute top-1/2 right-3 left-auto flex -translate-y-1/2',
                        suffixClassName,
                    )}
                >
                    {suffix}
                </span>
            )}
        </div>
    ),
);
PrefixSuffixInput.displayName = 'PrefixSuffixInput';

export { PrefixSuffixInput };
