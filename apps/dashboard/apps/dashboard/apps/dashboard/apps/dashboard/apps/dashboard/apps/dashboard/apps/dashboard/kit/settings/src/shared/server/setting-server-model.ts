import 'server-only';

import { AppClient } from '@kit/db';
import { z } from 'zod';
import { parseServerSettingConfig } from '../../config/parse-server-config';
import {
    ExtractSettingsValues,
    isSettingDefinition,
    SettingSchemaMap,
    StorageSettingDefinition,
} from '../../shared/type';
import { userAttributesStorage, userSettingsStorage } from '../user-setting-provider';

// Storage provider interface
export interface StorageProvider {
    /**
     * Fetch settings values.
     * It should return a record of settings values indexed by their keys
     *
     * Used to initialize the setting values in the forms and get the settings values.
     *
     * @param keys The setting keys to fetch
     */
    fetchFromStorage: (keys: string[], getDB: () => Promise<AppClient>) => Promise<Record<string, any>>;
    /**
     * Save settings values to the appropriate storage method.
     *
     * Used to update the settings values during form submission.
     *
     * @param values The setting values to save
     */
    saveToStorage: (values: Record<string, any>, getDB: () => Promise<AppClient>) => Promise<void>;
}

// // Global registry for setting models
// const SETTING_SERVER_MODEL_REGISTRY = new Map<string, SettingServerModel<any, any>>();

// /**
//  * Register a setting model in the global registry
//  */
// function registerSettingServerModel<T extends SettingSchemaMap<S>, S extends string = string>(
//     id: string,
//     model: SettingServerModel<T, S>
// ): void {
//     SETTING_SERVER_MODEL_REGISTRY.set(id, model);
// }

/**
 * Get a setting model from the global registry
 */
// export function requireSettingServerModel<T extends SettingSchemaMap<S>, S extends string = string>(
//     id: string
// ): SettingServerModel<T, S> {
//     const model = SETTING_SERVER_MODEL_REGISTRY.get(id);

//     if (!model) {
//         throw new Error(`Setting model with ID '${id}' not found in registry`);
//     }

//     return model;
// }

/**
 * Create a new SettingServerModel instance using the shared configuration
 */
// export function createSettingServerModel(
//     getDB: () => Promise<AppClient>
// ): SettingServerModel<any, any> {
//     return new SettingServerModel(getDB);
// }

// Storage provider interface
export class SettingServerModel<
    T extends SettingSchemaMap<S>,
    S extends string = string,
    // > extends SettingModel<T, S> {
> {
    private storageProviders: Record<string, StorageProvider>;
    private defaultStorageProvider: string;
    private settingsCache: Map<string, any> = new Map();
    private getDB: () => Promise<AppClient>;
    private schema: T;

    // Derived type for this model's settings
    readonly settingsType!: ExtractSettingsValues<T>;

    constructor(
        getDB: () => Promise<AppClient>,
        serverConfig: ReturnType<typeof parseServerSettingConfig>,
        schema: { schema: T },
    ) {
        // super(
        //     { schema: settingsSchemas.schema as T, id: settingsSchemas.id },
        //     { ui: [], id: settingsSchemas.id } // Empty UI config for server-side
        // );
        this.getDB = getDB;
        // this.serverConfig = serverConfig;
        this.schema = schema.schema;
        this.storageProviders = {
            user_settings: userSettingsStorage,
            user_attributes: userAttributesStorage,
            ...serverConfig.providers,
        } as Record<string, StorageProvider>;
        this.defaultStorageProvider = 'user_settings';

        // Register this model in the global registry
        // registerSettingServerModel(this.id, this);
    }

    private getSettingDefinition(key: keyof T): StorageSettingDefinition<any, string> {
        const definition = this.schema[key];

        if (!definition) {
            throw new Error(`Setting '${String(key)}' not found in schema`);
        }

        // Check if it's a proper setting definition
        if (isSettingDefinition(definition)) {
            return {
                schema: definition.schema,
                storage: definition.storage || this.defaultStorageProvider,
                defaultValue: definition.defaultValue,
            };
        }

        throw new Error(`Invalid setting definition for '${String(key)}'`);
    }

    async getSetting<K extends keyof T>(key: K): Promise<ExtractSettingsValues<T>[K]> {
        if (this.settingsCache.has(key as string)) {
            return this.settingsCache.get(key as string);
        }

        const definition = this.getSettingDefinition(key);
        const storageKey = definition.storage;
        const storageProvider = this.storageProviders[storageKey];

        if (!storageProvider) {
            throw new Error(`Storage provider '${storageKey}' not found for setting '${String(key)}'`);
        }

        // Fetch from the appropriate storage provider
        const result = await storageProvider.fetchFromStorage([key as string], this.getDB);
        const rawValue = result[key as string];

        try {
            // Validate and parse the value using zod
            const value = definition.schema.parse(rawValue);
            if (value) {
                this.settingsCache.set(key as string, value);
            }
            return value;
        } catch (error) {
            // If validation fails, return the default value if available
            if ('defaultValue' in definition) {
                return definition.defaultValue;
            }

            // Otherwise return the schema's default value if set
            if (
                definition.schema instanceof z.ZodType &&
                definition.schema._def &&
                'defaultValue' in definition.schema._def &&
                typeof definition.schema._def.defaultValue === 'function'
            ) {
                return definition.schema._def.defaultValue();
            }

            throw new Error(`Invalid setting value for '${String(key)}' and no default provided`);
        }
    }

    /**
     * Fetches multiple settings at once, optimizing the number of storage provider calls
     * by grouping settings by their storage provider
     * @param keys The setting keys to fetch
     * @returns A record of settings values indexed by their keys
     */
    // async getSettings<K extends keyof T>(keys: K[]): Promise<Record<K, ExtractSettingsValues<T>[K]>> {
    async getSettings<K extends keyof T>(keys: K[]): Promise<{ [key in K]: ExtractSettingsValues<T>[key] }> {
        const result: Record<string, any> = {};
        const toFetch: Record<string, K[]> = {};

        // First check the cache and group remaining keys by storage provider
        for (const key of keys) {
            if (this.settingsCache.has(key as string)) {
                result[key as string] = this.settingsCache.get(key as string);
            } else {
                const definition = this.getSettingDefinition(key);
                const storageKey = definition.storage;

                if (!toFetch[storageKey]) {
                    toFetch[storageKey] = [];
                }

                toFetch[storageKey].push(key);
            }
        }

        // Fetch settings from each storage provider
        for (const [storageKey, settingKeys] of Object.entries(toFetch)) {
            const storageProvider = this.storageProviders[storageKey as S];

            if (!storageProvider) {
                throw new Error(`Storage provider '${storageKey}' not found`);
            }

            const fetchResult = await storageProvider.fetchFromStorage(settingKeys as string[], this.getDB);

            // Process each result
            for (const key of settingKeys) {
                const definition = this.getSettingDefinition(key);
                const rawValue = fetchResult[key as string];

                try {
                    // Validate and parse the value using zod
                    const value = definition.schema.parse(rawValue);
                    if (value) {
                        this.settingsCache.set(key as string, value);
                    }
                    result[key as string] = value;
                } catch (error) {
                    // If validation fails, return the default value if available
                    if ('defaultValue' in definition) {
                        result[key as string] = definition.defaultValue;
                    } else if (
                        definition.schema instanceof z.ZodType &&
                        definition.schema._def &&
                        'defaultValue' in definition.schema._def &&
                        typeof definition.schema._def.defaultValue === 'function'
                    ) {
                        result[key as string] = definition.schema._def.defaultValue();
                    } else {
                        throw new Error(`Invalid setting value for '${String(key)}' and no default provided`);
                    }
                }
            }
        }

        return result as Record<K, ExtractSettingsValues<T>[K]>;
    }

    /**
     * Updates multiple settings at once, optimizing the number of storage provider calls
     * by grouping settings by their storage provider
     * @param settings Record of settings to update, with keys and their new values
     * @returns Promise that resolves when all settings are updated
     */
    async updateSettings<K extends keyof T>(settings: Partial<Record<K, ExtractSettingsValues<T>[K]>>): Promise<void> {
        // Group settings by storage provider
        const byStorageProvider: Record<string, Record<string, any>> = {};
        const validationErrors: Record<string, string> = {};

        // First validate all values and group by storage provider
        for (const [key, value] of Object.entries(settings)) {
            try {
                const definition = this.getSettingDefinition(key as keyof T);
                const storageKey = definition.storage;

                // Validate the value
                const parsedValue = definition.schema.parse(value);

                // Group by storage provider
                if (!byStorageProvider[storageKey]) {
                    byStorageProvider[storageKey] = {};
                }

                byStorageProvider[storageKey][key] = parsedValue;

                if (parsedValue) {
                    // Update cache immediately
                    this.settingsCache.set(key, parsedValue);
                } else {
                    // Remove from cache
                    this.settingsCache.delete(key);
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                validationErrors[key] = `Invalid value for setting '${key}': ${errorMessage}`;
            }
        }

        // If there are validation errors, throw with all errors
        if (Object.keys(validationErrors).length > 0) {
            throw new Error(`Validation errors: ${JSON.stringify(validationErrors)}`);
        }

        // Save to each storage provider
        const savePromises = Object.entries(byStorageProvider).map(([storageKey, values]) => {
            const storageProvider = this.storageProviders[storageKey as S];

            if (!storageProvider) {
                throw new Error(`Storage provider '${storageKey}' not found`);
            }

            return storageProvider.saveToStorage(values, this.getDB);
        });

        // Wait for all storage operations to complete
        await Promise.all(savePromises);
    }
}
