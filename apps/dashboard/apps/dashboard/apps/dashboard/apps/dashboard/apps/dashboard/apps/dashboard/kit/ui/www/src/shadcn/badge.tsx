/**
 * Tailwind v4 version @url https://ui.shadcn.com/docs/components/badge
 * With added success, warning, and info variants.
 */

import { cn } from '@kit/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const badgeVariants = cva(
    'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent',
                secondary: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent',
                destructive:
                    'bg-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 border-transparent text-white',
                outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
                success:
                    'border-transparent bg-green-50 text-green-500 dark:bg-green-500/20 [a&]:hover:bg-green-50 dark:[a&]:hover:bg-green-500/20',
                warning:
                    'border-transparent bg-orange-50 text-orange-500 dark:bg-orange-500/20 [a&]:hover:bg-orange-50 dark:[a&]:hover:bg-orange-500/20',
                info: 'border-transparent bg-blue-50 text-blue-500 dark:bg-blue-500/20 [a&]:hover:bg-blue-50 dark:[a&]:hover:bg-blue-500/20',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

function Badge({
    className,
    variant,
    asChild = false,
    ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : 'span';

    return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
