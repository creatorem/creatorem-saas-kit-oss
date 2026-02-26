/**
 * Tailwind v4 version @url https://ui.shadcn.com/docs/components/tabs
 * With added :
 * - cursor-pointer class
 */

'use client';

import { cn } from '@kit/utils';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col gap-2', className)} {...props} />;
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
    return (
        <TabsPrimitive.List
            data-slot="tabs-list"
            className={cn(
                'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]',
                className,
            )}
            {...props}
        />
    );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            data-slot="tabs-trigger"
            className={cn(
                "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:cursor-default data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        />
    );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <TabsPrimitive.Content data-slot="tabs-content" className={cn('flex-1 outline-none', className)} {...props} />
    );
}

const UnderlinedTabsList = React.forwardRef<
    React.ComponentRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn('text-muted-foreground inline-flex h-12 items-center justify-start', className)}
        {...props}
    />
));
UnderlinedTabsList.displayName = 'UnderlinedTabsList';

const UnderlinedTabsTrigger = React.forwardRef<
    React.ComponentRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            'text-muted-foreground ring-offset-background focus-visible:ring-ring data-[state=active]:border-b-primary data-[state=active]:text-foreground group relative mx-4 inline-flex h-12 items-center justify-center rounded-none border-b border-b-transparent bg-transparent py-1 pt-2 pb-3 text-sm whitespace-nowrap shadow-none transition-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:font-medium data-[state=active]:shadow-none',
            className,
        )}
        {...props}
    />
));
UnderlinedTabsTrigger.displayName = 'UnderlinedTabsTrigger';

const UnderlinedTabsContent = React.forwardRef<
    React.ComponentRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>((props, ref) => <TabsPrimitive.Content ref={ref} {...props} />);
UnderlinedTabsContent.displayName = 'UnderlinedTabsContent';

export { Tabs, TabsContent, TabsList, TabsTrigger, UnderlinedTabsContent, UnderlinedTabsList, UnderlinedTabsTrigger };
