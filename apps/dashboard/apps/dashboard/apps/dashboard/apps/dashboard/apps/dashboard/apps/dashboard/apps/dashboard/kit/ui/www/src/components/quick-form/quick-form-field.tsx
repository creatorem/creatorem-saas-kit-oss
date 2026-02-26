'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { QuickFormFieldComponent, QuickFormInputRenderer, quickFormFieldVariants } from '@kit/utils/quick-form';
import React from 'react';
import { ControllerFieldState, ControllerRenderProps, UseFormStateReturn } from 'react-hook-form';

export const QuickFormField: QuickFormFieldComponent = ({
    control,
    slug,
    label,
    description,
    descriptionPosition,
    type,
    variant,
    inputRenderer,
    inputs,
    schema,
    ...rest
}) => {
    // Determine if the field is required from the Zod schema
    // const isRequired = schema ? useFieldRequirement(schema, slug) : false;
    return (
        <FormField
            control={control}
            name={slug}
            render={({
                field,
            }: {
                field: ControllerRenderProps<Record<string, any>, string>;
                fieldState: ControllerFieldState;
                formState: UseFormStateReturn<Record<string, any>>;
            }) => {
                const isOptional = schema.shape[field.name]?.isOptional();
                return (
                    <FormItem className={quickFormFieldVariants({ variant })}>
                        <div className="flex flex-row items-center justify-between gap-4">
                            {label && <FormLabel required={!isOptional}>{label}</FormLabel>}
                            {type === 'boolean' && (
                                <FormControl>
                                    {inputRenderer ? (
                                        React.createElement(inputRenderer, { field, type, slug, ...rest })
                                    ) : (
                                        <QuickFormInputRenderer
                                            field={field}
                                            type={type}
                                            slug={slug}
                                            {...rest}
                                            inputs={inputs}
                                            variant={variant}
                                        />
                                    )}
                                </FormControl>
                            )}
                        </div>

                        {type !== 'boolean' && (
                            <div className="flex w-full flex-col gap-0.5">
                                {description && descriptionPosition === 'above' && (
                                    <FormDescription>{description}</FormDescription>
                                )}
                                <FormControl>
                                    {inputRenderer ? (
                                        React.createElement(inputRenderer, { field, type, slug, ...rest })
                                    ) : (
                                        <QuickFormInputRenderer
                                            field={field}
                                            type={type}
                                            slug={slug}
                                            {...rest}
                                            inputs={inputs}
                                            variant={variant}
                                        />
                                    )}
                                </FormControl>
                                {description && (!descriptionPosition || descriptionPosition === 'below') && (
                                    <FormDescription>{description}</FormDescription>
                                )}
                            </div>
                        )}

                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
};
