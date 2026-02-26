/**
 * Tailwind v4 version @url https://ui.shadcn.com/docs/components/alert
 * Changes:
 * - Added success, warning, and info variants.
 * - export alertVariants as a constant.
 * - change "has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr]" into "has-[>svg]:grid-cols-[calc(4px*4)_1fr]" no 'var(--spacing)'
 */

import { cn } from '@kit/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

export const alertVariants = cva(
    'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(4px*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
    {
        variants: {
            variant: {
                default: 'bg-card text-card-foreground',
                destructive:
                    'text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current',
                success:
                    'bg-card *:data-[slot=alert-description]:text-card-foreground text-green-600 [&>svg]:text-current',
                warning:
                    'bg-card *:data-[slot=alert-description]:text-card-foreground text-orange-600 [&>svg]:text-current',
                info: 'bg-card *:data-[slot=alert-description]:text-card-foreground text-blue-600 [&>svg]:text-current',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);
function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
    return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}
function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-title"
            className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
            {...props}
        />
    );
}
function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-description"
            className={cn(
                'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
                className,
            )}
            {...props}
        />
    );
}
export { Alert, AlertDescription, AlertTitle };
