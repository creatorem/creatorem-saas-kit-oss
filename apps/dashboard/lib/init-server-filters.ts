import 'server-only';
import { settingsSchemas } from '@kit/shared/config/settings.schema.config';
import { enqueueServerFilter, type FilterCallback } from '@kit/utils/filters/server';
import { orgConfig } from '~/config/org.config';

const SERVER_ADD_APP_SETTINGS_SCHEMAS = 'dashboardServerAddAppSettingsSchemas';
const serverAddAppSettingsSchemas: FilterCallback<'server_get_settings_schema'> = (inputSettingsSchema) => {
    return {
        schema: {
            ...inputSettingsSchema.schema,
            ...settingsSchemas.schema,
        },
    };
};

export const initServerFilters = () => {
    enqueueServerFilter('server_get_settings_schema', {
        name: SERVER_ADD_APP_SETTINGS_SCHEMAS,
        fn: serverAddAppSettingsSchemas,
        priority: 1,
    });
};
