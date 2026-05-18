'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo } from 'react';
import { type UseFormProps, UseFormReturn, useForm } from 'react-hook-form';
import { z } from 'zod';
import { StepperFormField } from '../stepper';
import {
    isLogicInputConfig,
    isQuickFormInputConfig,
    isQuickFormStepperConfig,
    isQuickFormUIComponent,
    isQuickFormWrapperConfig,
    QuickFormComponentProps,
    QuickFormConfig,
    QuickFormFieldComponent,
    QuickFormSchemaMap,
    QuickFormStepperComponent,
    QuickFormUIConfig,
    SettingsInputsBase,
    SettingWrapperComponent,
} from './types';

function useQuickFormZodSchema<
    T extends QuickFormSchemaMap = QuickFormSchemaMap,
    I extends SettingsInputsBase = SettingsInputsBase,
>(config: QuickFormConfig<T, I>) {
    return useMemo(() => {
        if ('shape' in config.schema) {
            return config.schema as unknown as z.ZodObject<
                z.ZodRawShape,
                'strip',
                z.ZodTypeAny,
                Record<string, any>,
                Record<string, any>
            >;
        }
        return z.object(config.schema as z.ZodRawShape);
    }, [config.schema]);
}

export function useQuickForm<
    T extends QuickFormSchemaMap = QuickFormSchemaMap,
    I extends SettingsInputsBase = SettingsInputsBase,
>({
    config,
    ...props
}: {
    config: QuickFormConfig<T, I>;
    // schema: TSchema;
} & Omit<UseFormProps<z.ZodType['_input']>, 'resolver'>) {
    const zodSchema = useQuickFormZodSchema(config);

    return useForm({
        ...props,
        resolver: zodResolver(zodSchema, undefined, {
            // This makes it so we can use `.transform()`s on the schema without same transform getting applied again when it reaches the server
            raw: true,
        }),
    });
}

export function useSettingsContent<
    T extends QuickFormSchemaMap = QuickFormSchemaMap,
    I extends SettingsInputsBase = SettingsInputsBase,
>({
    config,
    Wrapper,
    inputRenderer,
    form,
    variant,
    handleSubmit,
    QuickFormStepper,
    QuickFormField,
    inputs,
    WrapUIComponent,
    // submitButton,
}: {
    config: QuickFormConfig<T, I>;
    Wrapper: SettingWrapperComponent;
    inputs: I;
    handleSubmit: (values: Record<string, any>) => Promise<void>;
    inputRenderer?: React.ComponentType<{
        type: string;
        field: any;
        slug: string;
        [key: string]: any;
    }>;
    variant: QuickFormComponentProps<T, I>['variant'];
    form: UseFormReturn<any, any, any>;
    QuickFormStepper: QuickFormStepperComponent;
    QuickFormField: QuickFormFieldComponent<T, I>;
    WrapUIComponent?: (content: React.ReactNode) => React.ReactNode;
    // submitButton: React.ReactNode;
}) {
    const zodSchema = useQuickFormZodSchema(config);

    const applySectionSeparatorRules = (settings: QuickFormUIConfig<T, I>[]) => {
        const leafInputIndexes = settings.reduce<number[]>((accumulator, nestedSetting, nestedIndex) => {
            if (isQuickFormInputConfig(nestedSetting) || isLogicInputConfig(nestedSetting)) {
                accumulator.push(nestedIndex);
            }

            return accumulator;
        }, []);

        if (leafInputIndexes.length === 0) {
            return settings;
        }

        const lastLeafInputIndex = leafInputIndexes[leafInputIndexes.length - 1];

        return settings.map((nestedSetting, nestedIndex) => {
            if (isQuickFormInputConfig(nestedSetting) || isLogicInputConfig(nestedSetting)) {
                if (nestedIndex === lastLeafInputIndex) {
                    return {
                        ...nestedSetting,
                        hideSeparator: true,
                    };
                }

                if (typeof nestedSetting.hideSeparator !== 'undefined') {
                    return nestedSetting;
                }

                return {
                    ...nestedSetting,
                    hideSeparator: false,
                };
            }

            return nestedSetting;
        });
    };

    const renderSettings = (settings: QuickFormUIConfig<T, I>[], depth = 0) => {
        return settings
            .map((setting, index) => {
                // Handle UI component type
                if (isQuickFormUIComponent(setting)) {
                    const content = WrapUIComponent ? WrapUIComponent(setting.render) : setting.render;
                    return <React.Fragment key={`ui-${index}`}>{content}</React.Fragment>;
                }

                // Handle wrapper type with nested settings
                if (isQuickFormStepperConfig(setting)) {
                    const { steps: rawSteps, ...stepperProps } = setting;
                    return (
                        <QuickFormStepper
                            key={`stepper-${index}`}
                            {...stepperProps}
                            form={form}
                            // submitButton={submitButton}
                            onSubmit={form.handleSubmit(handleSubmit)}
                            rawSteps={rawSteps}
                            steps={rawSteps.map((s) => renderSettings(s.settings, depth + 1))}
                        >
                            {/* {renderSettings(setting.steps)} */}
                        </QuickFormStepper>
                    );
                }

                // Handle wrapper type with nested settings
                if (isQuickFormWrapperConfig(setting)) {
                    const nestedSettings =
                        setting.wrapperType === 'section'
                            ? applySectionSeparatorRules(setting.settings)
                            : setting.settings;

                    return (
                        <Wrapper
                            key={`wrapper-${index}`}
                            wrapperType={setting.wrapperType}
                            header={setting.header}
                            footer={setting.footer}
                            className={setting.className}
                            sectionClassName={setting.sectionClassName}
                            sectionInnerClassName={setting.sectionInnerClassName}
                            depth={depth}
                        >
                            {renderSettings(nestedSettings, depth + 1)}
                        </Wrapper>
                    );
                }

                // Handle normal setting field with slug
                if (isQuickFormInputConfig(setting) || isLogicInputConfig(setting)) {
                    const fieldName = isLogicInputConfig(setting) ? setting.name : String(setting.slug);
                    const { type, ...otherSettings } = setting;

                    return (
                        <StepperFormField key={fieldName} name={fieldName}>
                            <QuickFormField
                                control={form.control}
                                inputRenderer={inputRenderer}
                                {...otherSettings}
                                type={type as keyof I & string}
                                slug={fieldName}
                                variant={variant}
                                inputs={inputs}
                                schema={zodSchema}
                            />
                        </StepperFormField>
                    );
                }

                return null;
            })
            .filter((c) => c);
    };

    return <>{renderSettings(config.settings, 0)}</>;
}
