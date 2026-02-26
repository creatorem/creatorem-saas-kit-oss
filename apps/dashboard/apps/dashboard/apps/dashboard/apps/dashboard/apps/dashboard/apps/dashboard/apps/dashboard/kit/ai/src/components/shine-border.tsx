/**
 * Inspired from https://magicui.design/docs/components/shine-border
 */

'use client';

import { cn } from '@kit/utils';
import * as React from 'react';

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Width of the border in pixels
     * @default 1
     */
    borderWidth?: number;
    /**
     * Duration of the animation in seconds
     * @default 14
     */
    duration?: number;
    /**
     * Color of the border, can be a single color or an array of colors
     * @default "#000000"
     */
    shineColor?: string | string[];
    /**
     * Whether to hide the mask
     * @default false
     */
    noMask?: boolean;
}

/**
 * Shine Border
 *
 * An animated background border effect component with configurable properties.
 */
export function ShineBorder({
    borderWidth = 1,
    duration = 5,
    shineColor = '#000000',
    noMask = false,
    className,
    style,
    ...props
}: ShineBorderProps) {
    return (
        <div
            style={
                {
                    '--border-width': `${borderWidth}px`,
                    '--duration': `${duration}s`,
                    mask: noMask ? 'none' : `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
                    WebkitMask: noMask ? 'none' : `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
                    WebkitMaskComposite: noMask ? 'none' : 'xor',
                    maskComposite: noMask ? 'none' : 'exclude',
                    ...style,
                } as React.CSSProperties
            }
            className={cn(
                'pointer-events-none absolute inset-0 size-full overflow-hidden rounded-[inherit] p-(--border-width) will-change-[background-position]',
                className,
            )}
            {...props}
        >
            <div
                className="absolute top-1/2 left-1/2 aspect-square w-full -translate-x-1/2 -translate-y-1/2 animate-spin opacity-50 backdrop-blur"
                style={{
                    backgroundImage: `linear-gradient(130deg ,${Array.isArray(shineColor) ? shineColor.join(',') : shineColor})`,
                    animationDuration: `${duration}s`,
                }}
            />
        </div>
    );
}
