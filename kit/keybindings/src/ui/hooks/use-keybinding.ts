'use client';

import { useEffect } from 'react';
import type { KeybindingActions, KeybindingContext } from '../../types';
import { formatShortcutForDisplay } from '../../utils/parse-shortcut';
import { useKeybindings } from '../context';

// Global sequence state to avoid race conditions between multiple useKeybinding hooks
let globalSequence: string[] = [];
let globalTimeout: ReturnType<typeof setTimeout> | null = null;

const clearGlobalSequence = () => {
    globalSequence = [];
    if (globalTimeout) {
        clearTimeout(globalTimeout);
        globalTimeout = null;
    }
};

const addKeyToGlobalSequence = (key: string) => {
    globalSequence = [...globalSequence, key];

    // Clear sequence after 1 second
    if (globalTimeout) {
        clearTimeout(globalTimeout);
    }
    globalTimeout = setTimeout(clearGlobalSequence, 1000);
};

// Utility functions for keybinding logic

/**
 * Checks if a key is a modifier key (control, meta, alt, shift)
 */
const isModifierKey = (key: string): boolean => {
    return ['control', 'meta', 'alt', 'shift'].includes(key);
};

/**
 * Parses a shortcut string into modifiers and key parts
 * @param shortcutStr - The shortcut string (e.g., "cmd+shift+s")
 * @returns Object with modifiers array and key string
 */
const parseShortcutParts = (shortcutStr: string) => {
    const parts = shortcutStr.split('+');
    const modifiers = parts.filter((p) => ['cmd', 'ctrl', 'alt', 'shift', 'meta'].includes(p));
    const key = parts.find((p) => !['cmd', 'ctrl', 'alt', 'shift', 'meta'].includes(p));
    return { modifiers, key };
};

/**
 * Checks if the required modifiers in a shortcut match the current keyboard event
 * @param modifiers - Array of required modifier strings
 * @param event - The keyboard event
 * @returns True if modifiers match exactly
 */
const checkModifiersMatch = (modifiers: string[], event: KeyboardEvent): boolean => {
    const cmdOrCtrl = modifiers.includes('cmd') || modifiers.includes('ctrl');
    const needsCmd = cmdOrCtrl;
    const needsAlt = modifiers.includes('alt');
    const needsShift = modifiers.includes('shift');

    const hasCmd = event.metaKey || event.ctrlKey;
    const hasAlt = event.altKey;
    const hasShift = event.shiftKey;

    return needsCmd === hasCmd && needsAlt === hasAlt && needsShift === hasShift;
};

/**
 * Checks if key handling should be skipped based on input field context
 * @param event - The keyboard event
 * @param context - The keybinding context (global shortcuts are allowed in inputs)
 * @returns True if key handling should be skipped
 */
const shouldSkipInputField = (event: KeyboardEvent, context?: KeybindingContext): boolean => {
    const isInInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName);
    return isInInput && context !== 'global';
};

export function useKeybinding<T extends KeybindingActions = KeybindingActions>(
    actionId: keyof T & string,
    handler?: () => void,
    options?: {
        enabled?: boolean;
        preventDefault?: boolean;
    },
) {
    const { getShortcut, model } = useKeybindings<T>();
    const shortcut = getShortcut(actionId);
    const action = model[actionId];

    useEffect(() => {
        if (!handler || !shortcut || options?.enabled === false) return;

        const logSequenceDebug = (message: string, ...args: any[]) => {
            if (actionId === 'navigation.home') {
                console.log(`[${actionId}] ${message}`, ...args);
            }
        };

        const handleSequenceShortcut = (event: KeyboardEvent, normalizedShortcut: string) => {
            const key = event.key.toLowerCase();

            // Skip modifier keys
            if (isModifierKey(key)) return;

            const currentSequence = globalSequence.join(' ');
            const newSequence = currentSequence ? `${currentSequence} ${key}` : key;

            logSequenceDebug('Key pressed:', key);
            logSequenceDebug('Current sequence:', currentSequence);
            logSequenceDebug('Expected shortcut:', normalizedShortcut);
            logSequenceDebug('New sequence would be:', newSequence);
            logSequenceDebug('Shortcut starts with new sequence:', normalizedShortcut.startsWith(newSequence));

            // Check if the shortcut starts with potential new sequence
            if (normalizedShortcut.startsWith(newSequence)) {
                event.preventDefault();
                addKeyToGlobalSequence(key);

                logSequenceDebug('Added key to sequence, sequence is now:', newSequence);

                // If we've completed the sequence
                if (normalizedShortcut === newSequence) {
                    logSequenceDebug('Sequence completed! Executing handler.');
                    clearGlobalSequence();
                    handler();
                }
            } else if (normalizedShortcut.startsWith(key)) {
                // Clear current sequence and start over with this key
                clearGlobalSequence();
                event.preventDefault();
                addKeyToGlobalSequence(key);

                logSequenceDebug('Started new sequence with:', key);
            } else {
                // Key doesn't match, clear sequence
                clearGlobalSequence();
            }
        };

        const handleSingleShortcut = (event: KeyboardEvent, normalizedShortcut: string) => {
            const { modifiers, key } = parseShortcutParts(normalizedShortcut);

            if (!key) return;

            const modifiersMatch = checkModifiersMatch(modifiers, event);
            const keyMatches = event.key.toLowerCase() === key.toLowerCase();

            if (modifiersMatch && keyMatches) {
                if (options?.preventDefault !== false) {
                    event.preventDefault();
                }
                handler();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (shouldSkipInputField(event, action?.context)) return;

            const normalizedShortcut = shortcut.toLowerCase();
            const isSequence = normalizedShortcut.includes(' ');

            if (isSequence) {
                handleSequenceShortcut(event, normalizedShortcut);
            } else {
                handleSingleShortcut(event, normalizedShortcut);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handler, shortcut, options?.enabled, options?.preventDefault, action?.context]);

    return {
        shortcut,
        action,
        formattedShortcut: shortcut ? formatShortcutForDisplay(shortcut) : '',
    };
}
