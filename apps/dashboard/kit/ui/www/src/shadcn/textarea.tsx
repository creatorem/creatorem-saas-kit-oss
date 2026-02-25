'use client';

import { cn } from '@kit/utils';
import React, { useCallback, useEffect, useRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    autoResize?: boolean;
    autoResizeControlledHeight?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, autoResize = false, autoResizeControlledHeight, ...props }, ref) => {
        const textareaRef = useRef<HTMLTextAreaElement | null>(null);
        const heightBeforeControl = useRef<string | null>(null);

        const adjustHeight = useCallback(() => {
            const textarea = textareaRef.current;
            if (!textarea || !autoResize) return;
            if (autoResizeControlledHeight) {
                if (textarea.style.height) {
                    heightBeforeControl.current = textarea.style.height;
                }
                textarea.style.height = autoResizeControlledHeight;
                return;
            }

            if (heightBeforeControl.current) {
                textarea.style.height = heightBeforeControl.current;
                heightBeforeControl.current = null;
                return;
            }

            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }, [autoResizeControlledHeight]);

        useEffect(() => {
            adjustHeight();
        }, [props.value, adjustHeight]);

        const setRefs = (node: HTMLTextAreaElement | null) => {
            textareaRef.current = node;
            if (typeof ref === 'function') {
                ref(node);
            } else if (ref) {
                ref.current = node;
            }
        };

        return (
            <textarea
                className={cn(
                    'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
                    className,
                )}
                ref={setRefs}
                onInput={autoResize ? adjustHeight : undefined}
                {...props}
            />
        );
    },
);
Textarea.displayName = 'Textarea';

export { Textarea };
