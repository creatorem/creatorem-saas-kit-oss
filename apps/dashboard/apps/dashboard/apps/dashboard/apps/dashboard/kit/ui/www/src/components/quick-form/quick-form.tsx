'use client';

import { Button } from '@kit/ui/button';
import { Form } from '@kit/ui/form';
import { toast } from '@kit/ui/sonner';
import { cn } from '@kit/utils';
import {
    ExtractQuickFormValues,
    QuickFormComponentProps,
    QuickFormSchemaMap,
    SettingsInputsBase,
    SettingWrapperComponent,
    useQuickForm,
    useSettingsContent,
} from '@kit/utils/quick-form';
import React, { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { QuickFormField } from './quick-form-field';
import { QuickFormStepper } from './quick-form-stepper';
import { REGISTERED_INPUTS } from './registered-inputs';

const Wrapper: SettingWrapperComponent = ({ className, header, children }) => {
    return (
        <div className={cn('space-y-4', className)}>
            {header && <>{header}</>}
            {children}
        </div>
    );
};

// interface WebQuickFormComponentProps<
//     T extends QuickFormSchemaMap = QuickFormSchemaMap,
//     I extends SettingsInputsBase = SettingsInputsBase,
// > extends Omit<QuickFormComponentProps<T, I & typeof REGISTERED_INPUTS>, 'config' | 'inputs'> {
//     config: QuickFormConfig<T, I & typeof REGISTERED_INPUTS>;
//     inputs?: I;
// }

export function QuickForm<
    T extends QuickFormSchemaMap = QuickFormSchemaMap,
    I extends SettingsInputsBase = SettingsInputsBase,
>({
    config,
    defaultValues = {},
    onSubmit,
    inputRenderer,
    variant,
    inputs: extraInputs,
}: QuickFormComponentProps<T, I>) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useQuickForm({
        config,
        defaultValues: defaultValues as Record<string, any>,
        mode: 'onSubmit', // Only validate on submission
    });

    // Get form state for enabling/disabling submit button
    const { isDirty } = form.formState;

    // Handle form submission
    const handleSubmit = useCallback(
        async (values: Record<string, any>) => {
            setIsSubmitting(true);

            try {
                if (config.onSubmit) {
                    await config.onSubmit(form);
                }
                await onSubmit(values as ExtractQuickFormValues<T>);

                // Reset the form dirty state after successful submission
                form.reset(form.getValues());

                toast.success('Form submitted successfully');
            } catch (error) {
                console.log('Error submitting form:', error);
                // Extract user-friendly error message
                const errorMessage = error instanceof Error ? error.message : 'Failed to submit form';
                toast.error(errorMessage);
            } finally {
                setIsSubmitting(false);
            }
        },
        [onSubmit, form],
    );

    const submitButton = (
        <div className="flex justify-start pt-4">
            <Button
                type="submit"
                disabled={isSubmitting || !isDirty || config.submitButton?.disabled}
                className={cn('bg-green-600 hover:bg-green-700', config.submitButton?.className)}
                aria-label="Submit form"
            >
                {isSubmitting ? 'Submitting...' : config.submitButton?.text || 'Submit'}
            </Button>
        </div>
    );

    const settingsContent = useSettingsContent<T, I>({
        config,
        Wrapper,
        inputRenderer,
        form,
        variant,
        handleSubmit,
        inputs: {
            ...REGISTERED_INPUTS,
            ...((typeof extraInputs === 'object' ? extraInputs : {}) as I),
        },
        QuickFormStepper,
        QuickFormField,
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit as SubmitHandler<unknown>)}
                className={cn('space-y-6', config.className)}
            >
                {/* Render form header if provided */}
                {config.header && <div className="space-y-2">{config.header}</div>}

                {/* Render form title and description */}
                {(config.title || config.description) && (
                    <div className="space-y-2">
                        {config.title && <h2 className="text-2xl font-bold">{config.title}</h2>}
                        {config.description && <p className="text-muted-foreground">{config.description}</p>}
                    </div>
                )}

                {settingsContent}

                {config.submitButton?.hidden === true ? null : submitButton}
            </form>
        </Form>
    );
}
