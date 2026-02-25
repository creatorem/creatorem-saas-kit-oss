import { z } from 'zod';

export const KEYBINDINGS_SETTINGS_SCHEMA = z.record(z.string());

export const KEYBINDINGS_SETTING_NAME = 'keybindings';
