/**

 * Tailwind v4 version @url https://ui.shadcn.com/docs/components/button
 * With added :
 * - ghost_destructive and outline_destructive variants.
 * - xs size
 * - loading state
 * - required aria-label
 * - cursor-pointer class
 */

import { cn } from '@kit/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Spinner } from '../components/spinner';

const buttonVariants = cva(
    "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs',
                destructive:
                    'bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white shadow-xs',
                outline:
                    'bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs',
                ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
                link: 'text-primary underline-offset-4 hover:underline',
                ghost_destructive: 'text-destructive hover:bg-destructive/20',
                outline_destructive: 'border-destructive text-destructive bg-background hover:bg-destructive/10 border',
            },
            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3',
                xs: 'h-6 gap-1 rounded-md px-1 has-[>svg]:px-1',
                sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
                lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
                icon: 'size-9',
                'icon-sm': 'size-8',
                'icon-lg': 'size-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    innerClassName,
    children,
    ...props
}: React.ComponentProps<'button'> &
    Required<Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'>> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        loading?: boolean;
        innerClassName?: string;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="button"
            data-loading={loading}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        >
            {loading ? (
                <>
                    <div className={innerClassName}>{children}</div>
                    <Spinner className="size-4 text-current" />
                </>
            ) : (
                children
            )}
        </Comp>
    );
}

export { Button, buttonVariants };
