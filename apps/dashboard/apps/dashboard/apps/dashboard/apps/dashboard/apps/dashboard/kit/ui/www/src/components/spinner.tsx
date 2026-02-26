import { Icon } from '@kit/ui/icon';
import { cn } from '@kit/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const spinnerVariants = cva('flex-col items-center justify-center', {
    variants: {
        show: {
            true: 'flex',
            false: 'hidden',
        },
    },
    defaultVariants: {
        show: true,
    },
});

const loaderVariants = cva('text-primary animate-spin', {
    variants: {
        size: {
            small: 'size-6 shrink-0',
            medium: 'size-8 shrink-0',
            large: 'size-12 shrink-0',
        },
    },
    defaultVariants: {
        size: 'medium',
    },
});

interface SpinnerProps extends VariantProps<typeof spinnerVariants>, VariantProps<typeof loaderVariants> {
    className?: string;
    children?: React.ReactNode;
}

export function Spinner({ size, show, children, className }: SpinnerProps): React.JSX.Element {
    return (
        <span className={spinnerVariants({ show })}>
            <Icon name="Loader" className={cn(loaderVariants({ size }), className)} />
            {children}
        </span>
    );
}

interface CenteredSpinnerProps extends SpinnerProps {
    containerClassName?: React.HTMLAttributes<HTMLDivElement>['className'];
}

export function CenteredSpinner({ containerClassName, ...props }: CenteredSpinnerProps): React.JSX.Element {
    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-0 flex items-center justify-center opacity-65 select-none',
                containerClassName,
            )}
        >
            <Spinner {...props} />
        </div>
    );
}
