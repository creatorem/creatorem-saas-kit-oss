'use client';

import { Icon } from '@kit/ui/icon';
import { cn } from '@kit/utils';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import React from 'react';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = React.forwardRef<
    React.ComponentRef<typeof PopoverPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <PopoverPrimitive.Trigger ref={ref} className={cn('group', className)} {...props} />
));
PopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName;

const PopoverPortal = PopoverPrimitive.Portal;

const PopoverClose = PopoverPrimitive.Close;

const PopoverContent = React.forwardRef<
    React.ComponentRef<typeof PopoverPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
        closeIcon?: boolean;
        disableAutoFocus?: boolean;
    }
>(
    (
        { className, align = 'center', sideOffset = 4, closeIcon = true, disableAutoFocus = false, children, ...props },
        ref,
    ) => {
        const stopPropagation = React.useCallback((e: React.MouseEvent) => {
            e.stopPropagation();
        }, []);

        return (
            <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content
                    ref={ref}
                    align={align}
                    sideOffset={sideOffset}
                    className={cn(
                        'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-[300] rounded-md border p-4 shadow-md outline-hidden',
                        className,
                    )}
                    {...props}
                >
                    {disableAutoFocus && <input type="text" className="sr-only" style={{ width: 0, height: 0 }} />}
                    {children}
                    {closeIcon && (
                        <PopoverPrimitive.Close
                            onClick={stopPropagation}
                            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
                        >
                            <Icon name="X" className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </PopoverPrimitive.Close>
                    )}
                </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
        );
    },
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const PopoverArrow = React.forwardRef<
    React.ComponentRef<typeof PopoverPrimitive.Arrow>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow>
>(({ className, ...props }, ref) => (
    <PopoverPrimitive.Arrow ref={ref} className={cn('bg-popover', className)} {...props} asChild>
        <div className="bg-popover h-2 w-2 -translate-y-1/2 rotate-45 border-r border-b" />
    </PopoverPrimitive.Arrow>
));
PopoverArrow.displayName = PopoverPrimitive.Arrow.displayName;

const PopoverAnchor = PopoverPrimitive.Anchor;

export { Popover, PopoverAnchor, PopoverArrow, PopoverClose, PopoverContent, PopoverPortal, PopoverTrigger };
