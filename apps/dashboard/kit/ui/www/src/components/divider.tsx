'use client';

import { cn } from '@kit/utils';
import { ReactNode } from 'react';

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
    /** The direction of the divider */
    direction?: 'horizontal' | 'vertical';
    /** Optional label to display in the center of the divider */
    label?: ReactNode;
    /** Custom CSS classes for the label */
    labelClassName?: string;
    /** The color variant of the divider */
    variant?: 'default' | 'muted' | 'primary';
}

const variantStyles = {
    default: 'border-gray-300',
    muted: 'border-gray-200',
    primary: 'border-primary',
};

/**
 * A flexible divider component that supports both horizontal and vertical directions
 * with an optional label in the center.
 */
export function Divider({
    direction = 'horizontal',
    label,
    className,
    labelClassName,
    variant = 'default',
    ...props
}: DividerProps) {
    if (label) {
        return (
            <div className={cn('flex items-center', className)} {...props}>
                <hr
                    className={cn(
                        direction === 'vertical' ? 'h-full border-l' : 'w-full border-t',
                        variantStyles[variant],
                    )}
                />
                <div className="relative flex justify-center">
                    <span
                        className={cn(
                            'bg-background text-muted-foreground px-2 text-sm whitespace-nowrap',
                            labelClassName,
                        )}
                    >
                        {label}
                    </span>
                </div>
                <hr
                    className={cn(
                        direction === 'vertical' ? 'h-full border-l' : 'w-full border-t',
                        variantStyles[variant],
                    )}
                />
            </div>
        );
    }

    return (
        <hr
            {...props}
            className={cn(
                direction === 'vertical' ? 'h-full flex-1 border-l' : 'w-full border-t',
                variantStyles[variant],
                className,
            )}
        />
    );
}
