import type { KeybindingsStorage, UserKeybinding } from '../types';

// Keep the original LocalStorageKeybindingsStorage for backwards compatibility
const STORAGE_KEY = 'user-keybindings';

export class LocalStorageKeybindingsStorage implements KeybindingsStorage {
    async getUserKeybindings(): Promise<UserKeybinding[]> {
        if (typeof window === 'undefined') return [];

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    async setUserKeybinding(actionId: string, shortcut: string): Promise<void> {
        const keybindings = await this.getUserKeybindings();
        const existing = keybindings.findIndex((kb) => kb.actionId === actionId);

        if (existing >= 0 && keybindings[existing]) {
            keybindings[existing].shortcut = shortcut;
        } else {
            keybindings.push({ actionId, shortcut });
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(keybindings));
    }

    async resetKeybinding(actionId: string): Promise<void> {
        const keybindings = await this.getUserKeybindings();
        const filtered = keybindings.filter((kb) => kb.actionId !== actionId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }

    async resetAllKeybindings(): Promise<void> {
        localStorage.removeItem(STORAGE_KEY);
    }
}
