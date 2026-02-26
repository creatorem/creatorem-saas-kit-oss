'use client';

import { cn } from '@kit/utils';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import React from 'react';
import { type UseMediaQueryOptions, useMediaQuery } from '../hooks/use-media-query';

interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
    orientation?: 'vertical' | 'horizontal' | 'both';
    scrollBarClassName?: string;
}

const ScrollArea = React.forwardRef<React.ComponentRef<typeof ScrollAreaPrimitive.Root>, ScrollAreaProps>(
    ({ orientation = 'vertical', scrollBarClassName, className, children, ...props }, ref) => (
        <ScrollAreaPrimitive.Root ref={ref} className={cn('no-scrollbar relative', className)} {...props}>
            <ScrollAreaPrimitive.Viewport className="no-scrollbar size-full rounded-[inherit]">
                {children}
            </ScrollAreaPrimitive.Viewport>
            {orientation === 'both' ? (
                <>
                    <ScrollBar forceMount orientation="vertical" className={scrollBarClassName} />
                    <ScrollBar forceMount orientation="horizontal" className={scrollBarClassName} />
                </>
            ) : (
                <ScrollBar forceMount orientation={orientation} className={scrollBarClassName} />
            )}
            <ScrollAreaPrimitive.Corner />
        </ScrollAreaPrimitive.Root>
    ),
);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
    React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
        ref={ref}
        orientation={orientation}
        className={cn(
            'relative z-20 flex touch-none transition-colors select-none',
            orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-px',
            orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent p-px',
            className,
        )}
        {...props}
    >
        <ScrollAreaPrimitive.ScrollAreaThumb className="bg-border relative flex-1 rounded-full" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

interface ResponsiveScrollAreaProps extends ScrollAreaProps {
    breakpoint: string;
    mediaQueryOptions?: UseMediaQueryOptions;
    fallbackProps?: React.HTMLAttributes<HTMLDivElement>;
}

const ResponsiveScrollArea = React.forwardRef<HTMLDivElement, ResponsiveScrollAreaProps>(
    ({ breakpoint, mediaQueryOptions, children, fallbackProps, ...scrollAreaProps }, ref) => {
        const isBreakpointMatched = useMediaQuery(breakpoint, mediaQueryOptions);

        if (isBreakpointMatched) {
            return (
                <ScrollArea ref={ref} {...scrollAreaProps}>
                    {children}
                </ScrollArea>
            );
        }

        return (
            <div ref={ref} {...fallbackProps}>
                {children}
            </div>
        );
    },
);
ResponsiveScrollArea.displayName = 'ResponsiveScrollArea';

export { ResponsiveScrollArea, ScrollArea, ScrollBar };
