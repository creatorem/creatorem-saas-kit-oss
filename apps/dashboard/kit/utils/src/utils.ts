import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Check if the code is running in a browser environment.
 */
export function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

/**
 * @name formatCurrency
 * @description Format the currency based on the currency code
 */
export function formatCurrency(params: {
    currencyCode: string;
    locale: string;
    value: string | number;
    numberAfterComma?: number;
}) {
    return new Intl.NumberFormat(params.locale, {
        style: 'currency',
        currency: params.currencyCode,
        minimumFractionDigits: params.numberAfterComma,
        maximumFractionDigits: params.numberAfterComma,
    }).format(Number(params.value));
}

/**
 * @name cn
 * @description Merge classes together
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * @name generateID
 * @description Generate a unique ID
 * @returns The generated ID
 */
export const generateID = () => Math.random().toString(36).substring(2, 15);

export const debounce = (callback: (...args: unknown[]) => unknown, wait: number) => {
    let timeoutId: number | null = null;
    return (...args: unknown[]) => {
        window.clearTimeout(timeoutId as number);
        timeoutId = window.setTimeout(() => {
            callback(...args);
        }, wait);
    };
};
