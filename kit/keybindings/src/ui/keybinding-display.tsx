'use client';

import { cn } from '@kit/utils';
import React from 'react';
import { KeybindingActions } from '../types';
import { useShortcut } from './hooks/use-shortcut';

export interface KeybindingDisplayProps<T> {
    actionSlug: keyof T & string;
}

/**
 * Component that displays a keybinding shortcut in a UI-friendly format
 * with individual key badges and icons where appropriate
 */
export function KeybindingDisplay<T extends KeybindingActions = KeybindingActions>({
    actionSlug,
}: KeybindingDisplayProps<T>) {
    const { shortcut } = useShortcut(actionSlug);
    console.warn({ shortcutFromKeybindingsDisplay: shortcut });

    if (!shortcut) {
        return null;
    }

    const keys = shortcut.split(/[\s+]+/);

    return keys.map((key: string) => formatKeyForDisplay(key)).join(' + ');
}

/**
 * Component to render shortcuts with individual key badges
 * This is used in the keybindings table and other places where shortcuts are displayed
 */
export function ShortcutDisplay({
    shortcut,
    className,
    kbdClassName,
}: {
    shortcut: string | string[] | null;
    className?: string;
    kbdClassName?: string;
}) {
    if (!shortcut) {
        return (
            <span className="text-muted-foreground/60 inline-block min-w-[80px] text-center text-xs italic">
                unassigned
            </span>
        );
    }

    // Split the shortcut by '+' and trim whitespace
    const keys = Array.isArray(shortcut) ? shortcut : shortcut.split('+').map((key) => key.trim());

    return (
        <div className={cn('flex flex-wrap items-center gap-1', className)}>
            {keys.map((key, index) => (
                <React.Fragment key={index}>
                    <kbd
                        className={cn(
                            'text-foreground flex h-6 w-auto min-w-6 items-center justify-center rounded-sm border px-1 text-center font-mono text-xs',
                            kbdClassName,
                        )}
                    >
                        {formatKeyForDisplay(key)}
                    </kbd>
                </React.Fragment>
            ))}
        </div>
    );
}

function formatKeyForDisplay(key: string): string {
    const lowerKey = key.toLowerCase();

    // String mappings for special keys
    const stringMap: Record<string, string> = {
        cmd: '⌘',
        // 'ctrl': '⌃',
        // 'control': '⌃',
        ctrl: 'ctrl',
        control: 'ctrl',
        meta: '⌘',
        alt: '⌥',
        option: '⌥',
        shift: '⇧',
        space: '␣',
        spacebar: '␣',
        enter: '↵',
        return: '↵',
        backspace: '⌫',
        delete: '⌫',
        escape: 'Esc',
        esc: 'Esc',
        tab: '⇥',
        arrowup: '↑',
        arrowdown: '↓',
        arrowleft: '←',
        arrowright: '→',
        up: '↑',
        down: '↓',
        left: '←',
        right: '→',
        comma: ',',
    };

    // Return mapped string if available, otherwise return uppercased text
    return stringMap[lowerKey] || key.toUpperCase();
}
