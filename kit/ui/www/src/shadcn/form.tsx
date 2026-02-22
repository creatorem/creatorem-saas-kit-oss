'use client';

import { cn } from '@kit/utils';
import type * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import React from 'react';
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import { Controller, FormProvider, useFormContext } from 'react-hook-form';

import { Label } from './label';

const Form = FormProvider;

type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    ...props
}: ControllerProps<TFieldValues, TName>) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
};

const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const { getFieldState, formState } = useFormContext();

    const fieldState = getFieldState(fieldContext.name, formState);

    if (!fieldContext) {
        throw new Error('useFormField should be used within <FormField>');
    }

    const { id } = itemContext;

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    };
};

type FormItemContextValue = {
    id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
    const id = React.useId();

    return (
        <FormItemContext.Provider value={{ id }}>
            <div className={cn('flex flex-col gap-y-2', className)} {...props} />
        </FormItemContext.Provider>
    );
};
FormItem.displayName = 'FormItem';

export type FormLabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    required?: boolean;
};
const FormLabel = React.forwardRef<React.ComponentRef<typeof LabelPrimitive.Root>, FormLabelProps>(
    ({ required, children, className, ...props }, ref) => {
        const { error, formItemId } = useFormField();
        return (
            <Label ref={ref} className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...props}>
                {children}
                {required && <span className="text-destructive align-top">*</span>}
            </Label>
        );
    },
);
FormLabel.displayName = 'FormLabel';

const FormControl: React.FC<React.ComponentPropsWithoutRef<typeof Slot>> = ({ ...props }) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
        <Slot
            id={formItemId}
            aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
            aria-invalid={!!error}
            {...props}
        />
    );
};
FormControl.displayName = 'FormControl';

const FormDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => {
    const { formDescriptionId } = useFormField();

    return <p id={formDescriptionId} className={cn('text-muted-foreground text-[0.8rem]', className)} {...props} />;
};
FormDescription.displayName = 'FormDescription';

const FormMessage: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, children, ...props }) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) {
        return null;
    }

    return (
        <p id={formMessageId} className={cn('text-destructive text-[0.8rem] font-medium', className)} {...props}>
            {body}
        </p>
    );
};
FormMessage.displayName = 'FormMessage';

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField };
