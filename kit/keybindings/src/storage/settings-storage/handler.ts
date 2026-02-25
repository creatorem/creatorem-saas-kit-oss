import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { getKeybindingsRouter } from '../../router/router';
import { KeybindingsStorage, UserKeybinding } from '../../types';

export class DatabaseKeybindingsStorage implements KeybindingsStorage {
    private clientTrpc: TrpcClientWithQuery<ReturnType<typeof getKeybindingsRouter>>;

    constructor(clientTrpc: TrpcClientWithQuery<ReturnType<typeof getKeybindingsRouter>>) {
        this.clientTrpc = clientTrpc;
    }

    async getUserKeybindings(): Promise<UserKeybinding[]> {
        try {
            return (await this.clientTrpc.getKeybindingsList.fetch()).keybindings || [];
        } catch (error) {
            console.error('Failed to load keybindings from database:', error);
            return [];
        }
    }

    async setUserKeybinding(actionId: string, shortcut: string): Promise<void> {
        try {
            await this.clientTrpc.setKeybinding.fetch({ actionId, shortcut });
        } catch (error) {
            console.error('Failed to save keybinding to database:', error);
            throw error;
        }
    }

    async resetKeybinding(actionId: string): Promise<void> {
        try {
            await this.clientTrpc.deleteKeybinding.fetch({ actionId });
        } catch (error) {
            console.error('Failed to reset keybinding in database:', error);
            throw error;
        }
    }

    async resetAllKeybindings(): Promise<void> {
        try {
            await this.clientTrpc.resetKeybindings.fetch();
        } catch (error) {
            console.error('Failed to reset all keybindings in database:', error);
            throw error;
        }
    }
}
