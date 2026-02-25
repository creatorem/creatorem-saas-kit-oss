/**
 * Same as shadcn/ui/breadcrumb.tsx but with cn from @kit/utils
 * But with rounded-full px-2 py-1 hover:bg-muted applied on BreadcrumbLink
 */

import { Icon } from '@kit/ui/icon';
import { cn } from '@kit/utils';
import { Slot } from '@radix-ui/react-slot';
import Link from 'next/link';
import * as React from 'react';

function Breadcrumb({ ...props }: React.ComponentProps<'nav'>) {
    return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
    return (
        <ol
            data-slot="breadcrumb-list"
            className={cn(
                'text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5',
                className,
            )}
            {...props}
        />
    );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
    return <li data-slot="breadcrumb-item" className={cn('inline-flex items-center gap-1.5', className)} {...props} />;
}

function BreadcrumbLink({
    asChild,
    className,
    ...props
}: React.ComponentProps<'a'> & {
    asChild?: boolean;
}) {
    const Comp = asChild ? Slot : Link;

    return (
        // @ts-expect-error LinkProps is not assignable to React.ComponentProps<'a'>
        <Comp
            data-slot="breadcrumb-link"
            className={cn('hover:text-foreground hover:bg-muted rounded-full px-2 py-1 transition-colors', className)}
            {...props}
        />
    );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            data-slot="breadcrumb-page"
            role="link"
            aria-disabled="true"
            aria-current="page"
            className={cn('text-foreground font-normal', className)}
            {...props}
        />
    );
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
    return (
        <li
            data-slot="breadcrumb-separator"
            role="presentation"
            aria-hidden="true"
            className={cn('[&>svg]:size-3.5', className)}
            {...props}
        >
            {children ?? <Icon name="ChevronRight" />}
        </li>
    );
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            data-slot="breadcrumb-ellipsis"
            role="presentation"
            aria-hidden="true"
            className={cn('flex size-9 items-center justify-center', className)}
            {...props}
        >
            <Icon name="MoreHorizontal" className="size-4" />
            <span className="sr-only">More</span>
        </span>
    );
}

export {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
};
