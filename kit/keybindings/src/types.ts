import { z } from 'zod';

// Schema for KeybindingContext
export const keybindingContextSchema = z.enum(['global', 'contextual', 'form', 'item', 'modal', 'list']);
export type KeybindingContext = z.infer<typeof keybindingContextSchema>;

// Schema for KeybindingAction
export const keybindingActionSchema = z.object({
    name: z.string(),
    description: z.string(),
    defaultShortcut: z.string().optional(),
    context: keybindingContextSchema,
    url: z.string().optional(),
});
export type KeybindingAction = z.infer<typeof keybindingActionSchema>;

export const keybindingsModelSchema = z.record(z.string(), keybindingActionSchema);
export type KeybindingActions = z.infer<typeof keybindingsModelSchema>;

export type KeybindingsModel<T extends KeybindingActions = KeybindingActions> = T;

export interface UserKeybinding {
    actionId: string;
    shortcut: string;
}

export interface KeybindingsStorage {
    getUserKeybindings(): Promise<UserKeybinding[]>;
    setUserKeybinding(actionId: string, shortcut: string): Promise<void>;
    resetKeybinding(actionId: string): Promise<void>;
    resetAllKeybindings(): Promise<void>;
}
