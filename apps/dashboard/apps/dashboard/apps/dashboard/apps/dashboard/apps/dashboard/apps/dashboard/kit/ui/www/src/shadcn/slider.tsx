'use client';

import { cn } from '@kit/utils';
import * as SliderPrimitive from '@radix-ui/react-slider';
import React from 'react';

const Slider = React.forwardRef<
    React.ComponentRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, children, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        className={cn('relative flex w-full touch-none items-center select-none', className)}
        {...props}
    >
        {children}
    </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

// const SliderTrack = React.forwardRef<
//     React.ComponentRef<typeof SliderPrimitive.Track>,
//     React.ComponentPropsWithoutRef<typeof SliderPrimitive.Track>
// >(({ className, ...props }, ref) => (
//     <SliderPrimitive.Track
//         ref={ref}
//         className={cn('bg-primary/20 relative h-1.5 w-full grow overflow-hidden rounded-full', className)}
//         {...props}
//     />
// ));
// SliderTrack.displayName = SliderPrimitive.Track.displayName;

const SliderTrack = React.forwardRef<
    React.ComponentRef<typeof SliderPrimitive.Track>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Track> & {
        min?: number;
        max?: number;
        step?: number;
        showSteps?: number;
    }
>(({ className, min = 0, max = 100, step = 1, showSteps = undefined, ...props }, ref) => {
    const steps = React.useMemo(() => {
        if (!showSteps) return [];
        return Array.from({ length: showSteps - 1 }, (_, i) => {
            const position = ((i + 1) * 100) / showSteps;
            return position;
        });
    }, [min, max, step, showSteps]);

    return (
        <SliderPrimitive.Track
            ref={ref}
            className={cn('bg-primary/20 relative h-[4px] w-full grow overflow-hidden rounded-md', className)}
            {...props}
        >
            {steps.map((position, index) => (
                <div
                    key={index}
                    className="bg-muted-foreground/20 absolute top-0 h-full w-[2px]"
                    style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                />
            ))}
            {props.children}
        </SliderPrimitive.Track>
    );
});
SliderTrack.displayName = SliderPrimitive.Track.displayName;

const SliderThumb = React.forwardRef<
    React.ComponentRef<typeof SliderPrimitive.Thumb>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Thumb>
>(({ className, ...props }, ref) => (
    <SliderPrimitive.Thumb
        ref={ref}
        className={cn(
            'border-primary/50 bg-background focus-visible:ring-ring hover:bg-primary block h-4 w-4 cursor-grab rounded-full border shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-hidden active:cursor-grabbing active:shadow-[0_0_0_5px_rgba(0,0,0,0.10)] disabled:pointer-events-none disabled:opacity-50',
            className,
        )}
        {...props}
    />
));
SliderThumb.displayName = SliderPrimitive.Thumb.displayName;

const SliderRange = React.forwardRef<
    React.ComponentRef<typeof SliderPrimitive.Range>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Range>
>(({ className, ...props }, ref) => (
    <SliderPrimitive.Range ref={ref} className={cn('bg-primary absolute h-full', className)} {...props} />
));
SliderRange.displayName = SliderPrimitive.Range.displayName;

const SimpleSlider = React.forwardRef<
    React.ComponentRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
    <Slider ref={ref} {...props}>
        <SliderTrack>
            <SliderRange />
        </SliderTrack>
        <SliderThumb />
    </Slider>
));
SimpleSlider.displayName = 'SimpleSlider';

export { SimpleSlider, Slider, SliderRange, SliderThumb, SliderTrack };
