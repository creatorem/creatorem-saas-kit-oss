'use client';

import type { KeybindingActions } from '../../types';
import { formatShortcutForDisplay } from '../../utils/parse-shortcut';
import { useKeybindings } from '../context';

export function useShortcut<T extends KeybindingActions = KeybindingActions>(actionId: keyof T & string) {
    const { getShortcut } = useKeybindings<T>();
    const shortcut = getShortcut(actionId);

    return {
        shortcut,
        formattedShortcut: shortcut ? formatShortcutForDisplay(shortcut) : '',
    };
}
