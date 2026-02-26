import type { IconName as NIconName } from '@kit/native-ui/icon';
import type { IconName as WebIconName } from '@kit/ui/icon';
import { BaseSettingDefinition, ExtractSchemaType, QuickFormUIConfig, SettingsInputsBase } from '@kit/utils/quick-form';
import type { ControllerRenderProps } from 'react-hook-form';
import { z } from 'zod';
/* for typing purpose only */

export interface BaseInputProps {
    field: ControllerRenderProps<Record<string, any>, string>;
    slug: string;
}

// Generic value type for settings
type Value = string | number | boolean | Record<string, any> | null;

export type SettingOption = {
    label: React.ReactNode | string;
    value: Value;
};

// Enhanced setting definition with storage provider support
export interface StorageSettingDefinition<T, S extends string = string> extends BaseSettingDefinition<T> {
    storage: S; // Storage provider key
}

// Partial setting definition for user input that may not include storage
export type PartialSettingDefinition<T, S extends string = string> = BaseSettingDefinition<T> & {
    storage?: S;
};

// Allow either a ZodType directly or a PartialSettingDefinition
export type SettingDefinition<T, S extends string = string> = z.ZodType<T> | PartialSettingDefinition<T, S>;

// Helper type to check if an object is a setting definition
export function isSettingDefinition(def: any): def is PartialSettingDefinition<any> {
    return def && typeof def === 'object' && 'schema' in def && def.schema instanceof z.ZodType;
}

// Map of setting keys to their definitions with storage support
export type SettingSchemaMap<S extends string = string> = Record<string, SettingDefinition<any, S>>;

// Utility type to extract all setting values from a schema definition
export type ExtractSettingsValues<Sch extends SettingSchemaMap> = {
    [K in keyof Sch]: ExtractSchemaType<Sch[K]>;
};

export type SettingInputConfigUnion<
    Sch extends SettingSchemaMap = SettingSchemaMap,
    Inputs extends SettingsInputsBase = SettingsInputsBase,
> = {
    slug: keyof Sch;
    type: keyof Inputs;
    label: string;
    description?: string;
    descriptionPosition?: 'above' | 'below';
    [key: string]: any; // Allow additional props for extensible input types
};

// Use the union type instead of the generic version
export type SettingInputConfig<
    Sch extends SettingSchemaMap = SettingSchemaMap,
    Inputs extends SettingsInputsBase = SettingsInputsBase,
> = SettingInputConfigUnion<Sch, Inputs>;

// Enhanced page configuration for settings pages
export type PageConfig<Sch extends SettingSchemaMap, Inputs extends SettingsInputsBase> = {
    /**
     * The slug of the page
     * Used as a url path segment.
     * `index` value means the root page.
     */
    slug: string;
    /**
     * The title of the page
     * Used in the page meta title and menu.
     */
    title: string;
    /**
     * The icon for the page
     * Used in the menu and page header.
     */
    // icon?: IconName;
    icon: WebIconName | NIconName;
    /**
     * The description of the page
     * Used in the page meta description and menu.
     */
    description?: string;
    /**
     * The settings for this page
     * Array of setting configurations.
     */
    settings: QuickFormUIConfig<Sch, Inputs>[];
};

// Enhanced group configuration for grouping settings pages
export type GroupConfig<SchemaObj extends SettingSchemaMap, Inputs extends SettingsInputsBase> = {
    /**
     * The group identifier
     * Used for grouping related settings pages.
     */
    group: string;
    /**
     * The label for the group
     * Used in the menu and navigation.
     */
    label: string;
    /**
     * The settings pages in this group
     * Array of page configurations.
     */
    settingsPages: (PageConfig<SchemaObj, Inputs> | GroupConfig<SchemaObj, Inputs>)[];
};

// Union of all possible UI configurations
// export type UIConfig<Sch extends SettingSchemaMap, Inputs extends SettingsInputsBase = SettingsInputsBase> = (
//     | PageConfig<Sch, Inputs>
//     | GroupConfig<Sch, Inputs>
// )[];
export type UIConfig<
    Sch extends SettingSchemaMap,
    Inputs extends SettingsInputsBase = SettingsInputsBase,
> = GroupConfig<Sch, Inputs>[];

// Helper functions to check types
export function isPageConfig<Sch extends SettingSchemaMap, Inputs extends SettingsInputsBase = SettingsInputsBase>(
    config: PageConfig<Sch, Inputs> | GroupConfig<Sch, Inputs>,
): config is PageConfig<Sch, Inputs> {
    return 'slug' in config && 'settings' in config;
}

export function isGroupConfig<Sch extends SettingSchemaMap, Inputs extends SettingsInputsBase = SettingsInputsBase>(
    config: PageConfig<Sch, Inputs> | GroupConfig<Sch, Inputs>,
): config is GroupConfig<Sch, Inputs> {
    return 'group' in config && 'settingsPages' in config;
}
