// web only

import type { StorageProvider } from '../shared/server/setting-server-model';

/**
 * Storage provider for keybindings that stores data in the user_setting table
 * This provider is specifically designed to handle keybinding storage
 */
export class KeybindingsStorageProvider implements StorageProvider {
    private fetchHandler: (keys: string[]) => Promise<Record<string, any>>;
    private saveHandler: (values: Record<string, any>) => Promise<void>;

    constructor(
        fetchHandler: (keys: string[]) => Promise<Record<string, any>>,
        saveHandler: (values: Record<string, any>) => Promise<void>,
    ) {
        this.fetchHandler = fetchHandler;
        this.saveHandler = saveHandler;
    }

    async fetchFromStorage(keys: string[]): Promise<Record<string, any>> {
        // For keybindings, we store all shortcuts in a single JSON field
        if (keys.includes('keybindings')) {
            const result = await this.fetchHandler(['keybindings']);
            return result;
        }

        // For individual keybinding requests, extract from the main keybindings object
        const keybindingsResult = await this.fetchHandler(['keybindings']);
        const keybindings = keybindingsResult.keybindings || {};

        const result: Record<string, any> = {};
        for (const key of keys) {
            if (key.startsWith('keybinding.')) {
                const actionId = key.replace('keybinding.', '');
                result[key] = keybindings[actionId];
            }
        }

        return result;
    }

    async saveToStorage(values: Record<string, any>): Promise<void> {
        // Check if we're saving the entire keybindings object
        if ('keybindings' in values) {
            return this.saveHandler(values);
        }

        // Otherwise, we're updating individual keybindings
        // First fetch existing keybindings
        const existingResult = await this.fetchHandler(['keybindings']);
        const keybindings = existingResult.keybindings || {};

        // Update with new values
        let hasUpdates = false;
        for (const [key, value] of Object.entries(values)) {
            if (key.startsWith('keybinding.')) {
                const actionId = key.replace('keybinding.', '');
                if (value === null || value === undefined) {
                    delete keybindings[actionId];
                } else {
                    keybindings[actionId] = value;
                }
                hasUpdates = true;
            }
        }

        // Save back if there were updates
        if (hasUpdates) {
            await this.saveHandler({ keybindings });
        }
    }
}
