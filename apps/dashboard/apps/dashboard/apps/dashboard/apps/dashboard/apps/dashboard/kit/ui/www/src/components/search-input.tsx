'use client';

import { Icon } from '@kit/ui/icon';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../shadcn/button';
import { PrefixSuffixInput } from './prefix-suffix-input';

type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> & {
    debounceTime?: number;
    onClear?: () => void;
    clearButtonProps?: React.ComponentProps<typeof Button>;
    alwaysShowClearButton?: boolean;
};

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    (
        {
            onChange,
            value,
            disabled,
            debounceTime = 200,
            onClear,
            clearButtonProps,
            alwaysShowClearButton,
            className,
            ...props
        },
        ref,
    ) => {
        const [innerValue, setInnerValue] = useState(value || '');
        const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

        useEffect(() => {
            setInnerValue(value || '');
        }, [value]);

        const handleChange = useCallback(
            (event: React.ChangeEvent<HTMLInputElement>) => {
                const newValue = event.target.value;
                setInnerValue(newValue);

                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                timeoutRef.current = setTimeout(() => {
                    onChange?.(event);
                }, debounceTime);
            },
            [onChange, debounceTime],
        );

        const handleClear = useCallback(() => {
            setInnerValue('');
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            onChange?.({
                target: { value: '' },
            } as React.ChangeEvent<HTMLInputElement>);
            onClear?.();
        }, [onChange, onClear]);

        useEffect(() => {
            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };
        }, []);

        return (
            <PrefixSuffixInput
                ref={ref}
                disabled={disabled}
                value={innerValue}
                onChange={handleChange}
                prefix={<Icon name="Search" className="size-4 shrink-0" />}
                containerClassName={className}
                suffix={
                    alwaysShowClearButton || innerValue ? (
                        <Button
                            aria-label="Clear"
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="-mr-2.5 flex size-8"
                            onClick={handleClear}
                            {...clearButtonProps}
                        >
                            <Icon name="X" className="size-4 shrink-0" />
                        </Button>
                    ) : undefined
                }
                {...props}
            />
        );
    },
);

SearchInput.displayName = 'SearchInput';
