import 'server-only';

import { enqueueServerFilter, FilterCallback } from '@kit/utils/filters/server';
import { KEYBINDINGS_SETTING_NAME, KEYBINDINGS_SETTINGS_SCHEMA } from '../storage/settings-storage/settings';

const SERVER_ADD_KEYBINDINGS_SETTINGS_SCHEMAS = 'serverAddKeybindingsSettingsSchemas';
const serverAddKeybindingsSettingsSchemas: FilterCallback<'server_get_settings_schema'> = (settingsSchema) => {
    return {
        schema: {
            ...settingsSchema.schema,
            [KEYBINDINGS_SETTING_NAME]: {
                schema: KEYBINDINGS_SETTINGS_SCHEMA,
                storage: 'user_settings',
            },
        },
    };
};

export default function () {
    enqueueServerFilter('server_get_settings_schema', {
        name: SERVER_ADD_KEYBINDINGS_SETTINGS_SCHEMAS,
        fn: serverAddKeybindingsSettingsSchemas,
    });
}
