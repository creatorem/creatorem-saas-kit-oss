'use client';

import { cn } from '@kit/utils';
import { useCopyToClipboard } from '@kit/utils/hooks/use-copy-to-clipboard';
import React, { JSX, useCallback } from 'react';
import { toast } from 'sonner';
import { Icon } from '../icon';
import { Input } from '../shadcn/input';

interface Props extends Omit<React.ComponentPropsWithoutRef<typeof Input>, 'value' | 'readOnly'> {
    value: string;
    displayedValue?: string;
    previousContent?: JSX.Element;
    isDiv?: boolean;
    stopPropagation?: boolean;
}

export const Clipboard: React.FC<Props> = ({
    value,
    previousContent,
    displayedValue,
    className,
    isDiv = false,
    stopPropagation,
    ...props
}) => {
    const { isCopied, copyToClipboard } = useCopyToClipboard();

    const handleCopy = useCallback(async (): Promise<void> => {
        if (!value) {
            return;
        }
        await copyToClipboard(value);
        toast.success('Copied!');
    }, [value, copyToClipboard]);

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            stopPropagation && e.stopPropagation();
            handleCopy();
        },
        [stopPropagation, handleCopy],
    );

    return (
        <div
            className={cn('flex cursor-pointer items-center justify-between rounded-md border', className)}
            onClick={handleClick}
        >
            {previousContent ?? null}
            {isDiv ? (
                <div
                    className={
                        'group-hover:bg-muted flex-1 cursor-pointer border-none px-4 py-3 whitespace-nowrap transition'
                    }
                >
                    {displayedValue ?? value}
                </div>
            ) : (
                <Input
                    value={displayedValue ?? value}
                    className={'group-hover:bg-muted w-full flex-1 cursor-pointer border-none px-4 py-3 transition'}
                    readOnly
                    {...props}
                />
            )}
            <span className="bg-muted flex h-9 items-center rounded-r-sm border-l px-3">
                <Icon name={isCopied ? 'Check' : 'Copy'} className="size-4" />
            </span>
        </div>
    );
};
