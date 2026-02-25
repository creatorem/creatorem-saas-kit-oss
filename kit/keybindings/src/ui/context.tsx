'use client';

import * as React from 'react';
import { createContext, useContext } from 'react';
import { useKeybindingsFiltersWithContext } from '../filters/use-filters-with-ctx';
import { LocalStorageKeybindingsStorage } from '../storage/local-storage';
import type { KeybindingActions, KeybindingsModel, KeybindingsStorage, UserKeybinding } from '../types';
import { NavigationKeybindingsHandlers, NavigationKeybindingsProps } from './navigation-keybindings-handlers';

const KeybindingsProviderChild: React.FC = () => {
    useKeybindingsFiltersWithContext();
    return null;
};

interface KeybindingsContextValue<T extends KeybindingActions = KeybindingActions> {
    model: KeybindingsModel<T>;
    storage: KeybindingsStorage;
    userKeybindings: UserKeybinding[];
    isInitialized: boolean;
    getShortcut: (actionId: keyof T) => string | null;
    setShortcut: (actionId: keyof T, shortcut: string) => Promise<void>;
    resetShortcut: (actionId: keyof T) => Promise<void>;
    resetAllShortcuts: () => Promise<void>;
}

export const KeybindingsContext = createContext<KeybindingsContextValue | null>(null);

export function useKeybindings<T extends KeybindingActions = KeybindingActions>() {
    const context = useContext(KeybindingsContext) as KeybindingsContextValue<T> | null;
    if (!context) {
        throw new Error('useKeybindings must be used within a KeybindingsProvider');
    }
    return context;
}

export interface KeybindingsProviderProps<T extends KeybindingActions> extends NavigationKeybindingsProps {
    model: KeybindingsModel<T>;
    storage?: KeybindingsStorage;
    children: React.ReactNode;
}

export function KeybindingsProvider<T extends KeybindingActions>({
    model,
    storage: providedStorage,
    children,
    ...props
}: KeybindingsProviderProps<T>) {
    // Use a stable storage instance
    const storage = React.useMemo(() => providedStorage || new LocalStorageKeybindingsStorage(), [providedStorage]);

    // Initialize with empty array to avoid hydration mismatch
    const [userKeybindings, setUserKeybindings] = React.useState<UserKeybinding[]>([]);
    const [isInitialized, setIsInitialized] = React.useState(false);

    React.useEffect(() => {
        // Only run on client side after mount
        let mounted = true;

        // Small delay to ensure we're on the client
        const loadKeybindings = async () => {
            try {
                const keybindings = await storage.getUserKeybindings();
                if (mounted) {
                    setUserKeybindings(keybindings);
                    setIsInitialized(true);
                }
            } catch (error) {
                console.error('Failed to load user keybindings:', error);
                if (mounted) {
                    setIsInitialized(true);
                }
            }
        };

        loadKeybindings();

        return () => {
            mounted = false;
        };
    }, [storage]);

    const getShortcut = React.useCallback(
        (actionId: keyof T & string): string | null => {
            const userBinding = userKeybindings.find((kb) => kb.actionId === actionId);
            const shortcut = userBinding?.shortcut || model[actionId]?.defaultShortcut;
            return shortcut || null;
        },
        [model, userKeybindings, isInitialized],
    );

    const setShortcut = React.useCallback(
        async (actionId: keyof T & string, shortcut: string) => {
            await storage.setUserKeybinding(actionId, shortcut);
            const updated = await storage.getUserKeybindings();
            setUserKeybindings(updated);
        },
        [storage],
    );

    const resetShortcut = React.useCallback(
        async (actionId: keyof T & string) => {
            await storage.resetKeybinding(actionId);
            const updated = await storage.getUserKeybindings();
            setUserKeybindings(updated);
        },
        [storage],
    );

    const resetAllShortcuts = React.useCallback(async () => {
        await storage.resetAllKeybindings();
        setUserKeybindings([]);
    }, [storage]);

    const value = React.useMemo(
        () => ({
            model,
            storage,
            userKeybindings: isInitialized ? userKeybindings : [],
            isInitialized,
            getShortcut,
            setShortcut,
            resetShortcut,
            resetAllShortcuts,
        }),
        [model, storage, userKeybindings, isInitialized, getShortcut, setShortcut, resetShortcut, resetAllShortcuts],
    );

    return (
        <KeybindingsContext.Provider value={value}>
            <KeybindingsProviderChild />
            <NavigationKeybindingsHandlers {...props} model={model} />
            {children}
        </KeybindingsContext.Provider>
    );
}
