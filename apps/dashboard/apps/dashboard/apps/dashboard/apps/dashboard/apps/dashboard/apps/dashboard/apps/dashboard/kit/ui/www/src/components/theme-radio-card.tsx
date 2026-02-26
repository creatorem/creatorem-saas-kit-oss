'use client';

import { Icon } from '@kit/ui/icon';
import { cn } from '@kit/utils';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { capitalize } from 'lodash';
import React, { useMemo } from 'react';

export const ThemeRadioCard: React.FC<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>> = ({
    value,
    onValueChange,
    className,
    ...props
}) => {
    const themes = useMemo(() => ['light', 'dark', 'system'] as const, []);

    return (
        <RadioGroupPrimitive.Root
            value={value}
            onValueChange={onValueChange}
            className={cn('flex flex-row flex-wrap gap-4', className)}
            {...props}
        >
            {themes.map((theme) => (
                <RadioGroupPrimitive.Item
                    key={theme}
                    value={theme}
                    className={cn(
                        'group relative overflow-hidden rounded-md p-4',
                        'focus:outline-hidden',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'border-none p-0 hover:bg-transparent data-[state=checked]:bg-transparent',
                    )}
                >
                    <ThemeOption theme={theme} />
                    <div
                        className={cn(
                            'border-input bg-background absolute right-2 flex size-4 items-center justify-center rounded-full border',
                            'bottom-8 group-data-[state=checked]:!border-blue-500 group-data-[state=checked]:bg-blue-500',
                        )}
                    >
                        <Icon
                            name="Check"
                            className="text-primary-foreground size-3 shrink-0 opacity-0 group-data-[state=checked]:opacity-100"
                        />
                    </div>
                </RadioGroupPrimitive.Item>
            ))}
        </RadioGroupPrimitive.Root>
    );
};

interface ThemeOptionProps {
    theme: 'light' | 'dark' | 'system';
}

function ThemeOption({ theme }: ThemeOptionProps): React.JSX.Element {
    const letters = 'Aa';
    return (
        <>
            <div className="group relative flex w-[120px] cursor-pointer overflow-hidden rounded-lg border">
                {theme === 'light' && (
                    <div className="group flex w-[120px] items-end bg-neutral-50 pt-6 pl-6">
                        <div className="flex h-[56px] flex-1 rounded-tl-lg border-t border-l border-neutral-200 bg-white pt-2 pl-2 text-lg font-medium text-gray-700 duration-200 ease-out group-hover:scale-110">
                            {letters}
                        </div>
                    </div>
                )}
                {theme === 'dark' && (
                    <div className="group flex w-[120px] items-end bg-neutral-900 pt-6 pl-6">
                        <div className="flex h-[56px] flex-1 rounded-tl-lg border-t border-l border-neutral-700 bg-neutral-800 pt-2 pl-2 text-lg font-medium text-gray-200 duration-200 ease-out group-hover:scale-110">
                            {letters}
                        </div>
                    </div>
                )}
                {theme === 'system' && (
                    <>
                        <div className="flex w-[120px] items-end overflow-hidden bg-neutral-50 pt-6 pl-6">
                            <div className="flex h-[56px] flex-1 rounded-tl-lg border-t border-l border-neutral-200 bg-white pt-2 pl-2 text-lg font-medium text-gray-700 duration-200 ease-out group-hover:scale-110">
                                {letters}
                            </div>
                        </div>
                        <div className="flex w-[120px] items-end overflow-hidden bg-neutral-900 pt-6 pl-6">
                            <div className="bg-800 flex h-[56px] flex-1 rounded-tl-lg border-t border-l border-neutral-700 pt-2 pl-2 text-lg font-medium text-gray-200 duration-200 ease-out group-hover:scale-110">
                                {letters}
                            </div>
                        </div>
                    </>
                )}
                <span className="absolute right-2 bottom-2 hidden size-5 items-center justify-center rounded-full bg-blue-500 p-0.5 text-white">
                    <Icon name="Check" className="size-4 shrink-0" />
                </span>
            </div>
            <div className="block w-full p-2 pb-0 text-center text-xs font-normal">{capitalize(theme)}</div>
        </>
    );
}
