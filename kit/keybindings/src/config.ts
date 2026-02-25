import { type KeybindingActions, keybindingsModelSchema } from './types';

export function parseKeybindingsConfig<T extends KeybindingActions>(config: T): T {
    // Parse and validate the config using the Zod schema
    const parsedConfig = keybindingsModelSchema.parse(config);
    return parsedConfig as T;
}
