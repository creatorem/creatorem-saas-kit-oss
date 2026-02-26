'use client';

import { cn } from '@kit/utils';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import React from 'react';

const ToggleGroup = React.forwardRef<
    React.ComponentRef<typeof ToggleGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & { className?: string }
>(({ className, ...props }, ref) => (
    <ToggleGroupPrimitive.Root ref={ref} className={cn('m-0 inline-flex', className)} {...props} />
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
    React.ComponentRef<typeof ToggleGroupPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & {
        className?: string;
        primitiveStyle?: boolean;
    }
>(({ className, primitiveStyle = false, ...props }, ref) => (
    <ToggleGroupPrimitive.Item
        ref={ref}
        className={cn(
            'focus-visible:ring-ring px-4 py-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
            primitiveStyle
                ? ''
                : // data-[state=on]:pointer-events-none
                  'hover:bg-accent aria-pressed:bg-primary data-[state=on]:bg-primary flex items-center justify-center rounded-md transition aria-pressed:text-white data-[state=on]:text-white',
            className,
        )}
        {...props}
    />
));

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
