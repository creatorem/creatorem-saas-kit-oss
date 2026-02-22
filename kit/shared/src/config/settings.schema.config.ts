import { parseSchemaSettingConfig } from '@kit/settings/schema-config';
import { z } from 'zod';

export const settingsSchemas = parseSchemaSettingConfig({
    schema: {
        // User Profile Settings
        user_profile_url: {
            schema: z.string().nullable().default(null),
            storage: 'user_attributes',
        },
        user_name: {
            schema: z.string().default(''),
            storage: 'user_attributes',
        },
        user_email: {
            schema: z.string().email().nullable().default(null),
            storage: 'user_attributes',
        },
        user_phone: {
            schema: z.string().nullable().default(null),
            storage: 'user_attributes',
        },
        user_bio: {
            schema: z.string().max(500).default(''),
            storage: 'user_settings',
        },
        use_full_width: {
            schema: z.boolean().default(false),
            storage: 'user_settings',
        },

        // Appearance Settings
        theme: {
            schema: z.enum(['light', 'dark', 'system']),
            storage: 'user_settings',
        },
        // Notification Settings no implemented yet
        // email_notifications: {
        //     schema: z.boolean().default(true),
        //     storage: 'user_settings',
        // },
        // push_notifications: {
        //     schema: z.boolean().default(true),
        //     storage: 'user_settings',
        // },
        // notification_frequency: {
        //     schema: z.enum(['immediate', 'daily', 'weekly']).default('immediate'),
        //     storage: 'user_settings',
        // },
    },
});
