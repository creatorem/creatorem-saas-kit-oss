import { REGISTERED_INPUTS as UI_REGISTERED_INPUTS } from '@kit/ui/quick-form';

/**
 * Extends the UI package's registered inputs with settings-specific inputs
 * `ui` and `group` keys are already reserved.
 */
export const REGISTERED_SETTINGS_INPUTS = {
    ...UI_REGISTERED_INPUTS,
} as const;
