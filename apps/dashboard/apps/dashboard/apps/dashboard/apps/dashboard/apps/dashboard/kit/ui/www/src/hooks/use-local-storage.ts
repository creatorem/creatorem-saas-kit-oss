import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useState } from 'react';

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface WindowEventMap {
        'local-storage': CustomEvent;
    }
}

type UseLocalStorageOptions<T> = {
    serializer?: (value: T) => string;
    deserializer?: (value: string) => T;
    initializeWithValue?: boolean;
};

const IS_SERVER = typeof window === 'undefined';

export function useLocalStorage<T>(
    key: string,
    initialValue: T | (() => T),
    options: UseLocalStorageOptions<T> = {},
): [T, Dispatch<SetStateAction<T>>, () => void] {
    const { initializeWithValue = true } = options;

    const serializer = useCallback<(value: T) => string>(
        (value) => {
            if (options.serializer) {
                return options.serializer(value);
            }

            return JSON.stringify(value);
        },
        [options],
    );

    const deserializer = useCallback<(value: string) => T>(
        (value) => {
            if (options.deserializer) {
                return options.deserializer(value);
            }
            // Support 'undefined' as a value
            if (value === 'undefined') {
                return undefined as unknown as T;
            }

            const defaultValue = initialValue instanceof Function ? initialValue() : initialValue;

            let parsed: unknown;
            try {
                parsed = JSON.parse(value);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return defaultValue; // Return initialValue if parsing fails
            }

            return parsed as T;
        },
        [options, initialValue],
    );

    // Get from local storage then
    // parse stored json or return initialValue
    const readValue = useCallback((): T => {
        const initialValueToUse = initialValue instanceof Function ? initialValue() : initialValue;

        // Prevent build error "window is undefined" but keep working
        if (IS_SERVER) {
            return initialValueToUse;
        }

        try {
            const raw = window.localStorage.getItem(key);
            return raw ? deserializer(raw) : initialValueToUse;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValueToUse;
        }
    }, [initialValue, key, deserializer]);

    // Always initialize with initial value to prevent hydration mismatch
    // We'll update it after hydration if needed
    const [storedValue, setStoredValue] = useState(() =>
        initialValue instanceof Function ? initialValue() : initialValue,
    );

    // Track if we've hydrated and read from localStorage
    const [hasHydrated, setHasHydrated] = useState(false);

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue: Dispatch<SetStateAction<T>> = useCallback(
        (value) => {
            // Prevent build error "window is undefined" but keeps working
            if (IS_SERVER) {
                console.warn(`Tried setting localStorage key "${key}" even though environment is not a client`);
            }

            try {
                // Allow value to be a function so we have the same API as useState
                const newValue = value instanceof Function ? value(readValue()) : value;

                // Save to local storage
                window.localStorage.setItem(key, serializer(newValue));

                // Save state
                setStoredValue(newValue);

                // We dispatch a custom event so every similar useLocalStorage hook is notified
                window.dispatchEvent(new StorageEvent('local-storage', { key }));
            } catch (error) {
                console.warn(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key, serializer, readValue],
    );

    const removeValue = useCallback(() => {
        // Prevent build error "window is undefined" but keeps working
        if (IS_SERVER) {
            console.warn(`Tried removing localStorage key "${key}" even though environment is not a client`);
        }

        const defaultValue = initialValue instanceof Function ? initialValue() : initialValue;

        // Remove the key from local storage
        window.localStorage.removeItem(key);

        // Save state with default value
        setStoredValue(defaultValue);

        // We dispatch a custom event so every similar useLocalStorage hook is notified
        window.dispatchEvent(new StorageEvent('local-storage', { key }));
    }, [key, initialValue]);

    // Effect to read from localStorage after hydration
    useEffect(() => {
        if (initializeWithValue && !hasHydrated) {
            const value = readValue();
            setStoredValue(value);
            setHasHydrated(true);
        }
    }, [initializeWithValue, hasHydrated, readValue]);

    const handleStorageChange = useCallback(
        (event: StorageEvent | CustomEvent) => {
            if ((event as StorageEvent).key && (event as StorageEvent).key !== key) {
                return;
            }
            // Only update if we've already hydrated
            if (hasHydrated) {
                setStoredValue(readValue());
            }
        },
        [key, readValue, hasHydrated],
    );

    // Listen for storage events from other tabs/windows
    useEffect(() => {
        // this only works for other documents, not the current one
        window.addEventListener('storage', handleStorageChange);

        // this is a custom event, triggered in setValue and removeValue
        window.addEventListener('local-storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('local-storage', handleStorageChange);
        };
    }, [handleStorageChange]);

    return [storedValue, setValue, removeValue];
}
