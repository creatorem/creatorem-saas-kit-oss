export function parseShortcut(shortcut: string): string[] {
    return shortcut.toLowerCase().replace(/\s+/g, ' ').trim().split(' ');
}

export function normalizeShortcut(shortcut: string): string {
    const parts = parseShortcut(shortcut);
    const modifiers: string[] = [];
    const keys: string[] = [];

    for (const part of parts) {
        if (part.includes('+')) {
            const subParts = part.split('+');
            for (const subPart of subParts) {
                if (['cmd', 'ctrl', 'alt', 'shift', 'meta'].includes(subPart)) {
                    modifiers.push(subPart);
                } else {
                    keys.push(subPart);
                }
            }
        } else {
            keys.push(part);
        }
    }

    // Sort modifiers for consistency
    modifiers.sort();

    return [...modifiers, ...keys].join('+');
}

export function formatShortcutForDisplay(shortcut: string): string {
    const isMac = typeof window !== 'undefined' && navigator.platform.toLowerCase().includes('mac');

    return shortcut
        .replace(/cmd/gi, isMac ? '⌘' : 'Ctrl')
        .replace(/ctrl/gi, isMac ? '⌃' : 'Ctrl')
        .replace(/alt/gi, isMac ? '⌥' : 'Alt')
        .replace(/shift/gi, isMac ? '⇧' : 'Shift')
        .replace(/backspace/gi, isMac ? '⌫' : 'Backspace')
        .replace(/enter/gi, isMac ? '⏎' : 'Enter')
        .replace(/esc/gi, 'Esc')
        .replace(/\+/g, isMac ? '' : '+');
}
