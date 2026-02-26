import { and, eq, inArray, userSetting, user as userTable } from '@kit/drizzle';
import { camelCase } from 'lodash';
import { type StorageProvider } from '../shared/server/setting-server-model';

export const userAttributesStorage: StorageProvider = {
    fetchFromStorage: async (rawKeys, getDB) => {
        const keysConverter = Object.fromEntries(rawKeys.map((key) => [camelCase(key.replace('user_', '')), key]));
        const keys = Object.keys(keysConverter);
        const db = await getDB();
        const user = await db.user.require();

        const settings: Record<string, any> = {};

        for (const key of keys) {
            if (!(key in user)) {
                throw new Error(`Key ${key} not found in user`);
            }
            settings[key] = user[key as keyof typeof user];
        }

        const originalSettings = Object.fromEntries(
            Object.entries(settings).map(([key, value]) => [keysConverter[key], value]),
        );

        return originalSettings;
    },
    saveToStorage: async (rawValues, getDB) => {
        const values = Object.fromEntries(
            Object.entries(rawValues).map(([key, value]) => [camelCase(key.replace('user_', '')), value]),
        );

        const db = await getDB();
        await db.rls.transaction(async (tx) => {
            return await tx.update(userTable).set(values);
        });
    },
};

export const userSettingsStorage: StorageProvider = {
    fetchFromStorage: async (keys, getDB) => {
        const db = await getDB();
        const result = await db.rls.transaction(async (tx) => {
            return await tx.select().from(userSetting).where(inArray(userSetting.name, keys));
        });

        const settings: Record<string, any> = {};

        for (const item of result) {
            settings[item.name] = item.value;
        }

        return settings;
    },
    saveToStorage: async (values, getDB) => {
        const db = await getDB();
        const {
            data: { user },
        } = await db.supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        await db.rls.transaction(async (tx) => {
            const settingValues = Object.entries(values).map(([name, value]) => ({
                name,
                value,
                userId: user.id,
            }));

            // Check if setting exists first, then insert or update
            for (const setting of settingValues) {
                // First try to find if the setting already exists
                const existingSetting = await tx
                    .select()
                    .from(userSetting)
                    .where(and(eq(userSetting.name, setting.name), eq(userSetting.userId, setting.userId)))
                    .limit(1);

                if (existingSetting.length > 0) {
                    // Setting exists, update it
                    await tx
                        .update(userSetting)
                        .set({
                            value: setting.value,
                            updatedAt: new Date().toISOString(),
                        })
                        .where(and(eq(userSetting.name, setting.name), eq(userSetting.userId, setting.userId)));
                } else {
                    // Setting doesn't exist, insert it
                    await tx.insert(userSetting).values(setting);
                }
            }
        });
    },
};
