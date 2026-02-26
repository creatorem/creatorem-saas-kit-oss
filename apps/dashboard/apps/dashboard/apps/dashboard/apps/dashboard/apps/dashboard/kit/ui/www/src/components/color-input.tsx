'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PrefixSuffixInput } from './prefix-suffix-input';

type ColorInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'prefix'> & {
    value?: string;
    onChange?: (color: string) => void;
};

export function ColorInput({
    value = '#888888',
    onChange,
    disabled,
    placeholder,
    ...other
}: ColorInputProps): React.JSX.Element {
    const [inputValue, setInputValue] = useState(value);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const debouncedOnChange = useCallback(
        (newColor: string) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                onChange?.(newColor);
            }, 100);
        },
        [onChange],
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            debouncedOnChange(newValue);
        },
        [debouncedOnChange],
    );

    const handleColorChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newColor = e.target.value;
            setInputValue(newColor);
            onChange?.(newColor);
        },
        [onChange],
    );

    const colorPickerPrefix = useMemo(
        () => (
            <div className="relative -ml-2">
                <input
                    type="color"
                    value={value}
                    onChange={handleColorChange}
                    disabled={disabled}
                    className="border-input hover:bg-accent h-8 w-8 cursor-pointer rounded-sm bg-transparent p-2 disabled:cursor-not-allowed disabled:opacity-50 [&::-moz-color-swatch]:rounded [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
                    style={{
                        // Custom styling to match the original ColorPicker trigger
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                    }}
                    aria-label="Color picker"
                />
                <div className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-sm border"></div>
            </div>
        ),
        [value, handleColorChange, disabled],
    );

    return (
        <PrefixSuffixInput
            prefix={colorPickerPrefix}
            prefixClassName="pointer-events-auto"
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
            {...other}
        />
    );
}

ColorInput.displayName = 'ColorInput';
