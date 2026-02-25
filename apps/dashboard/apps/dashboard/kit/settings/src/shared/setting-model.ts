import {
    FormConfig,
    isFormConfig,
    isLogicInputConfig,
    isQuickFormInputConfig,
    isQuickFormWrapperConfig,
    QuickFormUIConfig,
    SettingsInputsBase,
} from '@kit/utils/quick-form';
import { z } from 'zod';
import {
    ExtractSettingsValues,
    isGroupConfig,
    isPageConfig,
    isSettingDefinition,
    PageConfig,
    SettingInputConfig,
    SettingSchemaMap,
    UIConfig,
} from './type';

// Re-export types for compatibility
export type { FormConfig, LogicInputConfig } from '@kit/utils/quick-form';

// Re-export helper functions for compatibility
export {
    isFormConfig,
    isLogicInputConfig,
    isQuickFormInputConfig,
    isQuickFormUIComponent,
    isQuickFormWrapperConfig,
} from '@kit/utils/quick-form';

export class SettingModel<T extends SettingSchemaMap, Inputs extends SettingsInputsBase> {
    protected schema: T;
    protected uiConfig: UIConfig<T, Inputs>;
    protected logicSchemas: Map<string, z.ZodType<any>> = new Map(); // Store logic input schemas

    // Derived type for this model's settings
    readonly settingsType!: ExtractSettingsValues<T>;

    constructor(schema: { schema: T }, uiConfig: { ui: UIConfig<T, Inputs> }) {
        this.schema = schema.schema;
        this.uiConfig = uiConfig.ui;

        // Extract and store logic schemas
        this.extractLogicSchemas();
    }

    /**
     * Extract logic input schemas from UI config and store them
     */
    private extractLogicSchemas(): void {
        const extractFromSettings = (settings: QuickFormUIConfig<T, Inputs>[]): void => {
            for (const setting of settings) {
                if (isLogicInputConfig(setting)) {
                    // Store the raw schema for server-side operations
                    this.logicSchemas.set(setting.name, setting.schema);
                } else if (isQuickFormWrapperConfig(setting)) {
                    extractFromSettings(setting.settings);
                } else if (isFormConfig(setting)) {
                    extractFromSettings(setting.settings);
                }
            }
        };

        const extractFromUIConfig = (configs: UIConfig<T, Inputs>): void => {
            for (const config of configs) {
                if (isPageConfig(config)) {
                    extractFromSettings(config.settings);
                } else if (isGroupConfig(config)) {
                    // @ts-expect-error - TODO: Fix UIConfig type - TypeScript has issues with union type discrimination in recursive contexts
                    extractFromUIConfig(config.settingsPages);
                }
            }
        };

        extractFromUIConfig(this.uiConfig);
    }

    private getZodSchema(key: keyof T): z.ZodType<any> {
        const definition = this.schema[key];

        if (!definition) {
            throw new Error(`Setting '${String(key)}' not found in schema`);
        }

        // Check if this is a Zod schema directly or a complex definition
        if (definition instanceof z.ZodType) {
            return definition;
        }

        if (isSettingDefinition(definition)) {
            return definition.schema;
        }

        throw new Error(`Invalid setting definition for '${String(key)}': no valid schema found`);
    }

    /**
     * Get the Zod schema for a logic input by name
     */
    getLogicSchema(name: string): z.ZodType<any> | undefined {
        return this.logicSchemas.get(name);
    }

    /**
     * Get a Zod schema for either a setting key or logic input name
     */
    getSchemaByKeyOrName(keyOrName: string): z.ZodType<any> | undefined {
        // First try as a setting key
        try {
            return this.getZodSchema(keyOrName as keyof T);
        } catch {
            // If not found in settings, try as logic input
            return this.getLogicSchema(keyOrName);
        }
    }

    getUIConfig(): UIConfig<T, Inputs> {
        return this.uiConfig;
    }

    // Find a page config by slug
    findPageConfigBySlug(slug: string): PageConfig<T, Inputs> | undefined {
        // Recursive function to search through the config tree
        const findInConfig = (configs: UIConfig<T, Inputs>): PageConfig<T, Inputs> | undefined => {
            for (const config of configs) {
                if (isPageConfig(config) && config.slug === slug) {
                    return config;
                } else if (isGroupConfig(config)) {
                    // @ts-expect-error - TODO: Fix UIConfig type - TypeScript has issues with union type discrimination in recursive contexts
                    const found = findInConfig(config.settingsPages);
                    if (found) return found;
                }
            }
            return undefined;
        };

        return findInConfig(this.uiConfig);
    }

    /**
     * Find a page config by slug anywhere in the configuration tree
     * This is used for direct page access without specifying the group path
     * @param slug The slug of the page to find
     * @returns The page config if found, undefined otherwise
     */
    findPageConfigBySlugAnywhere(slug: string): PageConfig<T, Inputs> | undefined {
        // Use the existing findPageConfigBySlug method since its implementation
        // already searches recursively through the entire tree
        return this.findPageConfigBySlug(slug);
    }

    /**
     * Find a page config by path (array of segments)
     * @param path Array of segments where each segment is a group value or a page slug
     * @returns The page config if found, undefined otherwise
     */
    findPageConfigByPath(path: string[]): PageConfig<T, Inputs> | undefined {
        // Handle empty path - equivalent to accessing root/index
        if (!path.length) {
            return this.findIndexPageConfig();
        }

        // Handle path with only 'index'
        if (path.length === 1 && path[0] === 'index') {
            return this.findIndexPageConfig();
        }

        // NEW ADDITION: Special case for direct page access
        // If the path is a single segment, try to find a page with that slug at any level
        if (path.length === 1 && path[0] !== 'index') {
            // We know slug is defined here because we checked path.length === 1
            // Type assertion is safe because we've verified path.length === 1
            const slug = path[0] as string;
            const pageConfig = this.findPageConfigBySlugAnywhere(slug);
            if (pageConfig) {
                return pageConfig;
            }
        }

        // Recursive function to search through the config tree
        const findInConfig = (
            configs: UIConfig<T, Inputs>,
            currentPath: string[],
        ): PageConfig<T, Inputs> | undefined => {
            if (currentPath.length === 0) return undefined;

            const [currentSegment, ...remainingPath] = currentPath;

            for (const config of configs) {
                // Special case: if the current segment is 'index' and this is a page config
                if (currentSegment === 'index' && isPageConfig(config) && config.slug === 'index') {
                    return config;
                }
                // Special case: if the current segment is 'index' and this is a group config
                else if (currentSegment === 'index' && isGroupConfig(config) && config.group === 'index') {
                    if (remainingPath.length === 0) {
                        // If no more segments, find the first page in this group with slug 'index'
                        for (const child of config.settingsPages) {
                            if (isPageConfig(child) && child.slug === 'index') {
                                return child;
                            }
                        }

                        // If no index page found, return the first page in this group
                        for (const child of config.settingsPages) {
                            if (isPageConfig(child)) {
                                return child;
                            }
                        }
                    } else {
                        // Continue searching in the index group
                        // @ts-expect-error - TODO: Fix UIConfig type - TypeScript has issues with union type discrimination in recursive contexts
                        const found = findInConfig(config.settingsPages, remainingPath);
                        if (found) return found;
                    }
                }
                // Normal case: match slug or group
                else if (isPageConfig(config) && config.slug === currentSegment && remainingPath.length === 0) {
                    return config;
                } else if (isGroupConfig(config) && config.group === currentSegment) {
                    if (remainingPath.length === 0) {
                        // If no more segments, find the first page in this group
                        for (const child of config.settingsPages) {
                            if (isPageConfig(child)) {
                                return child;
                            } else if (isGroupConfig(child)) {
                                // Try to find an index page in this group
                                const indexPage = findInConfig([child], ['index']);
                                if (indexPage) return indexPage;
                            }
                        }
                        // If no page found, try to find the first page in any subgroup
                        for (const child of config.settingsPages) {
                            if (isGroupConfig(child)) {
                                for (const grandchild of child.settingsPages) {
                                    if (isPageConfig(grandchild)) {
                                        return grandchild;
                                    }
                                }
                            }
                        }
                    } else {
                        // Continue searching in this group
                        // @ts-expect-error - TODO: Fix UIConfig type - TypeScript has issues with union type discrimination in recursive contexts
                        const found = findInConfig(config.settingsPages, remainingPath);
                        if (found) return found;
                    }
                }
            }

            return undefined;
        };

        return findInConfig(this.uiConfig, path);
    }

    /**
     * Find the root index page config
     * This is used for empty paths or paths with only 'index'
     * Traverses the hierarchy to find the most appropriate index page
     */
    private findIndexPageConfig(): PageConfig<T, Inputs> | undefined {
        // First try to find a top-level page with slug 'index'
        for (const config of this.uiConfig) {
            if (isPageConfig(config) && config.slug === 'index') {
                return config;
            }
        }

        // Then try to find an index group with an index page
        for (const config of this.uiConfig) {
            if (isGroupConfig(config) && config.group === 'index') {
                // Look for an index page within the index group
                for (const child of config.settingsPages) {
                    if (isPageConfig(child) && child.slug === 'index') {
                        return child;
                    }
                }

                // If no index page found, return the first page in this group
                for (const child of config.settingsPages) {
                    if (isPageConfig(child)) {
                        return child;
                    }
                }
            }
        }

        // If no explicit index page, look for any page in a top-level group named 'index'
        for (const config of this.uiConfig) {
            if (isGroupConfig(config) && config.group === 'index') {
                // Find first page in this group
                for (const child of config.settingsPages) {
                    if (isPageConfig(child)) {
                        return child;
                    }
                }
            }
        }

        // Finally, just return the first page we can find anywhere
        const findFirstPage = (configs: UIConfig<T, Inputs>): PageConfig<T, Inputs> | undefined => {
            for (const config of configs) {
                if (isPageConfig(config)) {
                    return config;
                } else if (isGroupConfig(config) && config.settingsPages.length > 0) {
                    // @ts-expect-error - TODO: Fix UIConfig type - TypeScript has issues with union type discrimination in recursive contexts
                    const found = findFirstPage(config.settingsPages);
                    if (found) return found;
                }
            }
            return undefined;
        };

        return findFirstPage(this.uiConfig);
    }

    getSettingUIConfig(key: keyof T): SettingInputConfig<T, Inputs> | undefined {
        // Recursive function to search through settings
        const findInSettings = (configs: UIConfig<T, Inputs>): SettingInputConfig<T, Inputs> | undefined => {
            for (const config of configs) {
                if (isPageConfig(config)) {
                    for (const setting of config.settings) {
                        // Check if it's an input setting with a slug property
                        if ('slug' in setting && setting.slug === key) {
                            return setting as SettingInputConfig<T, Inputs>;
                        } else if (
                            setting.type === 'wrapper' &&
                            'settings' in setting &&
                            Array.isArray(setting.settings)
                        ) {
                            for (const nestedSetting of setting.settings) {
                                if ('slug' in nestedSetting && nestedSetting.slug === key) {
                                    return nestedSetting as SettingInputConfig<T, Inputs>;
                                }
                            }
                        }
                    }
                } else if (isGroupConfig(config)) {
                    // @ts-expect-error - TODO: Fix UIConfig type - TypeScript has issues with union type discrimination in recursive contexts
                    const found = findInSettings(config.settingsPages);
                    if (found) return found;
                }
            }
            return undefined;
        };

        return findInSettings(this.uiConfig);
    }

    /**
     * Collects all setting keys and logic input names from a config array
     * @param settings Array of setting UI configs
     * @returns Object with arrays of setting keys (slugs) and logic names
     */
    collectSettingKeysFromConfig(settings: QuickFormUIConfig<T, Inputs>[]): {
        settingKeys: string[];
        logicNames: string[];
    } {
        const settingKeys: string[] = [];
        const logicNames: string[] = [];

        for (const setting of settings) {
            if (isQuickFormInputConfig(setting)) {
                settingKeys.push(setting.slug as string);
            } else if (isLogicInputConfig(setting)) {
                logicNames.push(setting.name);
            } else if (isQuickFormWrapperConfig(setting)) {
                const nested = this.collectSettingKeysFromConfig(setting.settings);
                settingKeys.push(...nested.settingKeys);
                logicNames.push(...nested.logicNames);
            } else if (isFormConfig(setting)) {
                const nested = this.collectSettingKeysFromConfig(setting.settings);
                settingKeys.push(...nested.settingKeys);
                logicNames.push(...nested.logicNames);
            }
        }

        return { settingKeys, logicNames };
    }

    /**
     * Gets the form schema for a group of settings.
     */
    getFormSchema(group: string | string[] | PageConfig<T, Inputs>): z.ZodObject<Record<string, z.ZodType<any>>> {
        // Find the group by slug if string is provided
        let groupConfig: PageConfig<T, Inputs>;

        if (typeof group === 'string') {
            const foundGroup = this.findPageConfigBySlug(group);
            if (!foundGroup) {
                throw new Error(`Group ${group} not found in model`);
            }
            groupConfig = foundGroup;
        } else if (Array.isArray(group)) {
            const foundGroup = this.findPageConfigByPath(group);
            if (!foundGroup) {
                throw new Error(`Group ${group.join('/')} not found in model`);
            }
            groupConfig = foundGroup;
        } else {
            groupConfig = group;
        }

        // Recursively collect settings from the config
        const collectSettings = (settings: any[]): Record<string, z.ZodType<any>> => {
            const schemaShape: Record<string, z.ZodType<any>> = {};

            for (const setting of settings) {
                // For normal settings with slug
                if (isQuickFormInputConfig(setting)) {
                    try {
                        // Try to get the schema for this setting
                        schemaShape[setting.slug as string] = this.getZodSchema(setting.slug as keyof T);
                    } catch (error) {
                        console.warn(`Warning: Schema not found for setting '${setting.slug}', skipping`);
                    }
                }
                // For logic inputs with name
                else if (isLogicInputConfig(setting)) {
                    const logicSchema = this.getLogicSchema(setting.name);
                    if (logicSchema) {
                        schemaShape[setting.name] = logicSchema;
                    } else {
                        console.warn(`Warning: Schema not found for logic input '${setting.name}', skipping`);
                    }
                }
                // For parent containers with nested settings
                else if (isQuickFormWrapperConfig(setting) && setting.settings) {
                    const nestedSettings = collectSettings(setting.settings);
                    Object.assign(schemaShape, nestedSettings);
                }
                // For form containers with nested settings
                else if (isFormConfig(setting) && setting.settings) {
                    const nestedSettings = collectSettings(setting.settings);
                    Object.assign(schemaShape, nestedSettings);
                }
                // 'ui' type components don't need schema entries
            }

            return schemaShape;
        };

        // Build the schema shape with settings from the group
        const schemaShape = collectSettings(groupConfig.settings);

        // Create the Zod schema
        return z.object(schemaShape);
    }

    /**
     * Creates a Zod schema object from a specific set of setting keys and logic names
     * @param keys Array of setting keys to include in the schema
     * @param logicNames Array of logic input names to include in the schema
     * @returns A Zod object schema for validating form data
     */
    getCustomFormSchema<K extends keyof T>(
        keys: Array<K>,
        logicNames: string[] = [],
    ): z.ZodObject<Record<string, z.ZodType<any>>> {
        const schemaShape: Record<string, z.ZodType<any>> = {};

        // Add setting schemas
        for (const key of keys) {
            schemaShape[key as string] = this.getZodSchema(key);
        }

        // Add logic schemas
        for (const name of logicNames) {
            const logicSchema = this.getLogicSchema(name);
            if (logicSchema) {
                schemaShape[name] = logicSchema;
            }
        }

        return z.object(schemaShape);
    }

    /**
     * Gets the form schema for a specific form by its ID
     * @param formId The ID of the form to get the schema for
     * @returns A Zod object schema for validating the form data
     */
    getFormSchemaById(formId: string): z.ZodObject<Record<string, z.ZodType<any>>> {
        // Find the form config by ID
        const formConfig = this.findFormConfigById(formId);
        if (!formConfig) {
            throw new Error(`Form with ID '${formId}' not found in model`);
        }

        // Collect settings from the form
        const { settingKeys, logicNames } = this.collectSettingKeysFromConfig(formConfig.settings);

        // Create the schema
        const schemaShape: Record<string, z.ZodType<any>> = {};

        // Add setting schemas
        for (const key of settingKeys) {
            try {
                schemaShape[key] = this.getZodSchema(key as keyof T);
            } catch (error) {
                console.warn(`Warning: Schema not found for setting '${key}', skipping`);
            }
        }

        // Add logic schemas
        for (const name of logicNames) {
            const logicSchema = this.getLogicSchema(name);
            if (logicSchema) {
                schemaShape[name] = logicSchema;
            } else {
                console.warn(`Warning: Schema not found for logic input '${name}', skipping`);
            }
        }

        return z.object(schemaShape);
    }

    /**
     * Finds a form config by its ID anywhere in the configuration tree
     * @param formId The ID of the form to find
     * @returns The form config if found, undefined otherwise
     */
    findFormConfigById(formId: string): FormConfig<T, Inputs> | undefined {
        const findInConfigs = (configs: UIConfig<T, Inputs>): FormConfig<T, Inputs> | undefined => {
            for (const config of configs) {
                if (isPageConfig(config)) {
                    const found = this.findFormInSettings(config.settings, formId);
                    if (found) return found;
                } else if (isGroupConfig(config)) {
                    // @ts-expect-error - TODO: Fix UIConfig type - TypeScript has issues with union type discrimination in recursive contexts
                    const found = findInConfigs(config.settingsPages);
                    if (found) return found;
                }
            }
            return undefined;
        };

        return findInConfigs(this.uiConfig);
    }

    /**
     * Recursively searches for a form config in settings
     * @param settings Array of setting UI configs to search
     * @param formId The ID of the form to find
     * @returns The form config if found, undefined otherwise
     */
    private findFormInSettings(
        settings: QuickFormUIConfig<T, Inputs>[],
        formId: string,
    ): FormConfig<T, Inputs> | undefined {
        for (const setting of settings) {
            if (isFormConfig(setting) && setting.id === formId) {
                return setting;
            } else if (isQuickFormWrapperConfig(setting)) {
                const found = this.findFormInSettings(setting.settings, formId);
                if (found) return found;
            }
        }
        return undefined;
    }

    /**
     * Get the default path for navigation
     * Finds the first available page or index page
     * @returns Array of segments representing the path to the default page
     */
    getDefaultPath(): string[] {
        // First, try to find an explicit index page
        const findIndexPath = (configs: UIConfig<T, Inputs>, currentPath: string[] = []): string[] | undefined => {
            for (const config of configs) {
                if (isPageConfig(config) && config.slug === 'index') {
                    return [...currentPath, 'index'];
                } else if (isGroupConfig(config)) {
                    // Check if this group is an index group
                    if (config.group === 'index') {
                        // First try to find an index page in this group
                        for (const child of config.settingsPages) {
                            if (isPageConfig(child) && child.slug === 'index') {
                                return [...currentPath, 'index', 'index'];
                            }
                        }

                        // If no index page found in the index group, find the first page
                        for (const child of config.settingsPages) {
                            if (isPageConfig(child)) {
                                return [...currentPath, 'index', child.slug];
                            }
                        }
                    }

                    // Check for index pages in non-index groups
                    // @ts-expect-error - TODO: Fix UIConfig type - TypeScript has issues with union type discrimination in recursive contexts
                    const indexInGroup = findIndexPath(config.settingsPages, [...currentPath, config.group]);
                    if (indexInGroup) return indexInGroup;
                }
            }
            return undefined;
        };

        const indexPath = findIndexPath(this.uiConfig);
        if (indexPath) return indexPath;

        // If no index page, find the first available page
        const findFirstPath = (configs: UIConfig<T, Inputs>, currentPath: string[] = []): string[] => {
            for (const config of configs) {
                if (isPageConfig(config)) {
                    return [...currentPath, config.slug];
                } else if (isGroupConfig(config) && config.settingsPages.length > 0) {
                    // @ts-expect-error - TODO: Fix UIConfig type - TypeScript has issues with union type discrimination in recursive contexts
                    return findFirstPath(config.settingsPages, [...currentPath, config.group]);
                }
            }
            return currentPath; // Fallback to current path if no pages found
        };

        return findFirstPath(this.uiConfig);
    }

    /**
     * Execute custom onSubmit callbacks for logic inputs in a form
     * @param formId The ID of the form
     * @param values The form values
     */
    async executeFormLogicCallbacks(formId: string, values: Record<string, any>): Promise<void> {
        const formConfig = this.findFormConfigById(formId);
        if (!formConfig) {
            throw new Error(`Form with ID '${formId}' not found in model`);
        }

        await this.executeLogicCallbacks(formConfig.settings, values);
    }

    /**
     * Recursively execute logic input callbacks
     * @param settings Array of setting UI configs
     * @param values The form values
     */
    private async executeLogicCallbacks(
        settings: QuickFormUIConfig<T, Inputs>[],
        values: Record<string, any>,
    ): Promise<void> {
        for (const setting of settings) {
            if (isLogicInputConfig(setting) && setting.onSubmit) {
                await setting.onSubmit(values);
            } else if (isQuickFormWrapperConfig(setting)) {
                await this.executeLogicCallbacks(setting.settings, values);
            } else if (isFormConfig(setting)) {
                await this.executeLogicCallbacks(setting.settings, values);
            }
        }
    }
}
