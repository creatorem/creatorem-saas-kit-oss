'use client';

import { FilterCallback, useEnqueueFilter } from '@kit/utils/filters';
import { KeybindingDisplay, useKeybindings } from '../ui';
import { formatShortcutForDisplay } from '../utils/parse-shortcut';
/**
 * Enqueue all app events that need useOrganization to work.
 */
export function useKeybindingsFiltersWithContext() {
    /**
     * KeybindingDisplay use `useShortcut` that use `useKeybindings` under the hood
     */
    const DISPLAY_KEYBINDINGS_COMPONENT = 'displayKeybindingsComponent';
    const displayKeybindingsComponent: FilterCallback<'display_keybinding'> = (children, { actionSlug }) => {
        return (
            // @ts-ignore
            <KeybindingDisplay actionSlug={actionSlug}>{children}</KeybindingDisplay>
        );
    };
    useEnqueueFilter('display_keybinding', {
        name: DISPLAY_KEYBINDINGS_COMPONENT,
        fn: displayKeybindingsComponent,
    });

    const { getShortcut } = useKeybindings();

    /**
     * KeybindingDisplay use `useShortcut` that use `useKeybindings` under the hood
     */
    const GET_SHORTCUT_FROM_KEYBINDINGS = 'getShortcutFromKeybindings';
    const getShortcutFromKeybindings: FilterCallback<'get_shortcut'> = (_, { actionSlug }) => {
        const shortcut = getShortcut(actionSlug);
        return {
            shortcut,
            formattedShortcut: shortcut ? formatShortcutForDisplay(shortcut) : '',
        };
    };

    useEnqueueFilter('get_shortcut', {
        name: GET_SHORTCUT_FROM_KEYBINDINGS,
        fn: getShortcutFromKeybindings,
    });
}
