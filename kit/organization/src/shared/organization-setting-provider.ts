import { and, eq, inArray, organizationSetting, organization as organizationTable } from '@kit/drizzle';
import { OrganizationDBClient } from '@kit/organization/shared/server';
import { type StorageProvider } from '@kit/settings/shared/server/setting-server-model';
import { camelCase } from 'lodash';

export const organizationAttributesStorage: StorageProvider = {
    fetchFromStorage: async (rawKeys: string[], getDB) => {
        const keysConverter = Object.fromEntries(
            rawKeys.map((key) => [camelCase(key.replace('organization_', '')), key]),
        );
        const keys = Object.keys(keysConverter);
        const db = await getDB();
        const organizationClient = new OrganizationDBClient(db);
        const organization = await organizationClient.require();

        const settings: Record<string, any> = {};

        for (const key of keys) {
            if (!(key in organization)) {
                throw new Error(`Key ${key} not found in organization`);
            }
            settings[key] = organization[key as keyof typeof organization];
        }

        const originalSettings = Object.fromEntries(
            Object.entries(settings).map(([key, value]) => [keysConverter[key], value]),
        );

        return originalSettings;
    },
    saveToStorage: async (rawValues: Record<string, any>, getDB) => {
        const values = Object.fromEntries(
            Object.entries(rawValues).map(([key, value]) => [camelCase(key.replace('organization_', '')), value]),
        );

        const db = await getDB();
        await db.rls.transaction(async (tx) => {
            return await tx.update(organizationTable).set(values);
        });
    },
};

export const organizationSettingsStorage: StorageProvider = {
    fetchFromStorage: async (keys: string[], getDB) => {
        const db = await getDB();
        const result = await db.rls.transaction(async (tx) => {
            return await tx.select().from(organizationSetting).where(inArray(organizationSetting.name, keys));
        });

        const settings: Record<string, any> = {};

        for (const item of result) {
            settings[item.name] = item.value;
        }

        return settings;
    },
    saveToStorage: async (values: Record<string, any>, getDB) => {
        const db = await getDB();
        const organizationClient = new OrganizationDBClient(db);
        const organization = await organizationClient.require();

        await db.rls.transaction(async (tx) => {
            const settingValues = Object.entries(values).map(([name, value]) => ({
                name,
                value,
                organizationId: organization.id,
            }));

            // Check if setting exists first, then insert or update
            for (const setting of settingValues) {
                // First try to find if the setting already exists
                const existingSetting = await tx
                    .select()
                    .from(organizationSetting)
                    .where(
                        and(
                            eq(organizationSetting.name, setting.name),
                            eq(organizationSetting.organizationId, setting.organizationId),
                        ),
                    )
                    .limit(1);

                if (existingSetting.length > 0) {
                    // Setting exists, update it
                    await tx
                        .update(organizationSetting)
                        .set({
                            value: setting.value,
                            updatedAt: new Date().toISOString(),
                        })
                        .where(
                            and(
                                eq(organizationSetting.name, setting.name),
                                eq(organizationSetting.organizationId, setting.organizationId),
                            ),
                        );
                } else {
                    // Setting doesn't exist, insert it
                    await tx.insert(organizationSetting).values(setting);
                }
            }
        });
    },
};
