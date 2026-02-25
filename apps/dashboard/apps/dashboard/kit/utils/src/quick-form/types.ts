import React from 'react';
import type { Control, UseFormReturn } from 'react-hook-form';
import { type UnknownKeysParam, z } from 'zod';

export interface BaseInputProps {
    field: ControllerRenderProps<Record<string, any>, string>;
    slug: string;
    variant: QuickFormComponentProps<any, any>['variant'];
}

// Generic value type for settings
type Value = string | number | boolean | Record<string, any> | null;

export type SettingOption = {
    label: React.ReactNode | string;
    value: Value;
};

// Local type definition for ControllerRenderProps to avoid react-hook-form dependency
export interface ControllerRenderProps<
    TFieldValues extends Record<string, any> = Record<string, any>,
    TName extends keyof TFieldValues = keyof TFieldValues,
> {
    onChange: (...event: any[]) => void;
    onBlur: () => void;
    value: TFieldValues[TName];
    name: TName;
    ref: React.Ref<HTMLInputElement>;
    disabled?: boolean;
}

// Base input type - can be extended by other packages
type BaseQuickFormInputType =
    | 'number'
    | 'boolean'
    | 'text'
    | 'textarea'
    | 'phone'
    | 'select'
    | 'color'
    | 'time'
    | 'radio'
    | 'theme'
    | 'question_select';

export type QuickFormInput<P = {}> = React.FC<BaseInputProps & P>;

export type SettingsInputsBase = Record<string, QuickFormInput<any>>;

// Extensible input type that allows additional input types from other packages
// export type QuickFormInputType = BaseQuickFormInputType | string;

// Base setting definition for QuickForm (no storage needed)
export interface BaseSettingDefinition<T> {
    schema: z.ZodType<T>;
    defaultValue?: T;
}

// Setting definition for QuickForm (simplified, no storage needed)
export type QuickFormSettingDefinition<T> = BaseSettingDefinition<T>;

// Map of setting keys to their definitions for QuickForm
export type QuickFormSchemaMap = Record<string, QuickFormSettingDefinition<any> | z.ZodType<any>>;

// Helper type to check if an object is a setting definition
export function isQuickFormSettingDefinition(def: any): def is QuickFormSettingDefinition<any> {
    return def && typeof def === 'object' && 'schema' in def && def.schema instanceof z.ZodType;
}

// Helper type to extract the schema type from a SettingDefinition
export type ExtractSchemaType<T> =
    T extends z.ZodType<any> ? z.infer<T> : T extends { schema: z.ZodType<any> } ? z.infer<T['schema']> : never;

// Utility type to extract all setting values from a schema definition
export type ExtractQuickFormValues<T extends QuickFormSchemaMap> = {
    [K in keyof T]: ExtractSchemaType<T[K]>;
};

// Create a mapped type for QuickForm input configurations
export type QuickFormInputConfig<
    Sch extends QuickFormSchemaMap = QuickFormSchemaMap,
    Inputs extends SettingsInputsBase = SettingsInputsBase,
> = {
    slug: keyof Sch | null;
    type: keyof Inputs | BaseQuickFormInputType;
    // type: infer G & keyof Inputs;
    // type: infer G;
    label?: string;
    description?: string;
    descriptionPosition?: 'above' | 'below';
    // Allow any additional props for extensible input types
    [key: string]: any;
    // props: Omit<React.ComponentPropsWithoutRef<Inputs[G]>, 'field' | 'slug'>
};
// } & Omit<React.ComponentPropsWithoutRef<Inputs[T]>, 'field' | 'slug'>

// UI component type for custom renders
export type QuickFormUIComponent = {
    type: 'ui';
    render: React.ReactNode;
};

// Wrapper configuration for grouping inputs
export type QuickFormWrapperConfig<
    T extends QuickFormSchemaMap = QuickFormSchemaMap,
    Inputs extends SettingsInputsBase = SettingsInputsBase,
> = {
    type: 'wrapper';
    className?: string;
    header?: React.ReactNode;
    settings: QuickFormUIConfig<T, Inputs>[];
};

export type QuickFormStepperConfig<
    T extends QuickFormSchemaMap = QuickFormSchemaMap,
    Inputs extends SettingsInputsBase = SettingsInputsBase,
> = {
    type: 'stepper';
    className?: string;
    contentClassName?: string;
    header?: (steps: QuickFormStepConfig<any, any>[]) => React.ReactNode;
    footer?: React.ReactNode;
    steps: QuickFormStepConfig<T, Inputs>[];
    // lastNextIsSubmit?: boolean;
    nextButton?: {
        className?: string;
    };
    hidePrevious?: boolean;
    after?: React.ReactNode;
};

export type QuickFormStepConfig<
    T extends QuickFormSchemaMap = QuickFormSchemaMap,
    Inputs extends SettingsInputsBase = SettingsInputsBase,
> = {
    type: 'step';
    label?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    canGoNext?: (form: UseFormReturn<any>) => Promise<boolean>;
    settings: (
        | QuickFormUIComponent
        | QuickFormInputConfig<T, Inputs>
        | QuickFormWrapperConfig<T, Inputs>
        | QuickFormStepperConfig<T, Inputs>
        | LogicInputConfig<T, Inputs>
    )[];
};

// Logic input configuration for non-persisted inputs with custom handlers
export type LogicInputConfig<
    T extends QuickFormSchemaMap = QuickFormSchemaMap,
    I extends SettingsInputsBase = SettingsInputsBase,
> = {
    name: string; // unique identifier for this logic input
    type: I; // input type with autocompletion from REGISTERED_INPUTS
    label?: string;
    description?: string;
    descriptionPosition?: 'above' | 'below';
    schema: z.ZodType<any>; // Custom schema for this input
    onSubmit?: (values: Record<string, any>) => Promise<void>; // Custom submit handler
    clearOnSubmit?: boolean; // Whether to clear this field after successful submission
    [key: string]: any; // Allow additional props
};

// Form configuration for complex forms
export type FormConfig<
    T extends QuickFormSchemaMap = QuickFormSchemaMap,
    I extends SettingsInputsBase = SettingsInputsBase,
> = {
    type: 'form';
    id: string; // Unique identifier for the form
    className?: string;
    header?: React.ReactNode;
    submitButton?: {
        text?: string;
        className?: string;
        disabled?: boolean;
    };
    settings: QuickFormUIConfig<T, I>[];
};

// Union of all possible QuickForm UI configurations
export type QuickFormUIConfig<
    Sch extends QuickFormSchemaMap = QuickFormSchemaMap,
    I extends SettingsInputsBase = SettingsInputsBase,
> =
    | QuickFormUIComponent
    | QuickFormInputConfig<Sch, I>
    | QuickFormWrapperConfig<Sch, I>
    | QuickFormStepperConfig<Sch, I>
    | LogicInputConfig<Sch, I>
    | FormConfig<Sch, I>;

// Main QuickForm configuration
export interface QuickFormConfig<
    T extends QuickFormSchemaMap = QuickFormSchemaMap,
    I extends SettingsInputsBase = SettingsInputsBase,
> {
    id: string; // Unique identifier for the form
    title?: string;
    description?: string;
    className?: string;
    header?: React.ReactNode;
    submitButton?: {
        text?: string;
        className?: string;
        disabled?: boolean;
        hidden?: boolean;
    };
    onSubmit?: (form: UseFormReturn<any>) => Promise<void>;
    settings: QuickFormUIConfig<T, I>[];
    schema:
        | T
        | z.ZodObject<
              {
                  [x: string]: any;
              },
              UnknownKeysParam,
              z.ZodTypeAny,
              {
                  [x: string]: any;
              },
              {
                  [x: string]: any;
              }
          >; // The schema map for this form
}

// Helper functions to check types
export function isQuickFormUIComponent<T extends QuickFormSchemaMap, I extends SettingsInputsBase>(
    config: QuickFormUIConfig<T, I>,
): config is QuickFormUIComponent {
    return config.type === 'ui';
}

export function isQuickFormWrapperConfig<T extends QuickFormSchemaMap, I extends SettingsInputsBase>(
    config: QuickFormUIConfig<T, I>,
): config is QuickFormWrapperConfig<T, I> {
    return config.type === 'wrapper';
}

export function isQuickFormStepperConfig<T extends QuickFormSchemaMap, I extends SettingsInputsBase>(
    config: QuickFormUIConfig<T, I>,
): config is QuickFormStepperConfig<T, I> {
    return config.type === 'stepper';
}

export function isQuickFormInputConfig<T extends QuickFormSchemaMap, I extends SettingsInputsBase>(
    config: QuickFormUIConfig<T, I>,
): config is QuickFormInputConfig<T, I> {
    return (
        'slug' in config &&
        config.slug &&
        'type' in config &&
        !isQuickFormUIComponent(config) &&
        !isQuickFormWrapperConfig(config)
    );
}

export function isLogicInputConfig<T extends QuickFormSchemaMap, I extends SettingsInputsBase>(
    config: QuickFormUIConfig<T, I>,
): config is LogicInputConfig<T, I> {
    // return 'name' in config && 'schema' in config && (!('slug' in config) || config.slug === null);
    return 'name' in config && 'schema' in config && (!('slug' in config) || config.slug === null);
}

export function isFormConfig<T extends QuickFormSchemaMap, I extends SettingsInputsBase>(
    config: QuickFormUIConfig<T, I>,
): config is FormConfig<T, I> {
    return config.type === 'form';
}

/* Components definitions */

export type SettingWrapperComponent = React.FC<{
    className?: string;
    header?: React.ReactNode;
    children: React.ReactNode;
}>;

export type QuickFormStepperComponent = React.FC<
    Omit<QuickFormStepperConfig<any, any>, 'type' | 'steps'> & {
        form: UseFormReturn<any, any, any>;
        onSubmit: () => void;
        rawSteps: QuickFormStepperConfig<any, any>['steps'];
        steps: React.ReactNode[];
        // submitButton: React.ReactNode;
    }
>;

export type QuickFormFieldComponent<
    T extends QuickFormSchemaMap = QuickFormSchemaMap,
    I extends SettingsInputsBase = SettingsInputsBase,
> = React.FC<{
    slug: keyof T & string;
    label?: string;
    control: Control<Record<string, any>>;
    type: (keyof I | BaseQuickFormInputType) & string;
    description?: string;
    inputs: Record<string, React.FC<BaseInputProps & any>>;
    descriptionPosition?: 'above' | 'below';
    inputRenderer?: React.ComponentType<{
        type: string;
        field: any;
        slug: string;
        [key: string]: any;
    }>;
    schema: z.ZodObject<z.ZodRawShape, 'strip', z.ZodTypeAny, Record<string, any>, Record<string, any>>; // Optional schema for determining field requirements
    [key: string]: any;
}>;

export interface QuickFormComponentProps<
    T extends QuickFormSchemaMap = QuickFormSchemaMap,
    I extends SettingsInputsBase = SettingsInputsBase,
> {
    config: QuickFormConfig<T, I>;
    variant?: 'default' | 'full-width';
    defaultValues?: Partial<ExtractQuickFormValues<T>>;
    onSubmit: (values: ExtractQuickFormValues<T>) => Promise<void> | void;
    inputs?: I;
    // Optional custom input renderer for extensible input types
    inputRenderer?: React.ComponentType<{
        type: string;
        field: any;
        slug: string;
        [key: string]: any;
    }>;
}
