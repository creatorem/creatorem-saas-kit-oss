'use client';

/**
 * This component provides a dynamic form builder with Zod validation,
 * supporting various field types and consistent styling.
 */

import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { RadioGroup, RadioGroupItem } from '@kit/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { cn } from '@kit/utils';
import { useZodForm } from '@kit/utils/hooks/use-zod-form';
import React from 'react';
import { z } from 'zod';
import type { BaseEntity, ContentFormField, ContentFormProps } from '../../../shared/types';

export function ContentForm<T extends BaseEntity>({
    contentType,
    fields,
    onSubmit,
    defaultValues = {},
    mode = 'create',
    className,
    ...props
}: ContentFormProps<T>) {
    const [isLoading, setIsLoading] = React.useState(false);

    const schema = React.useMemo(() => {
        const schemaFields: Record<string, z.ZodTypeAny> = {};

        fields.forEach((field) => {
            let fieldSchema: z.ZodTypeAny;

            switch (field.type) {
                case 'email':
                    fieldSchema = z.string().email();
                    break;
                case 'tel':
                    fieldSchema = z.string();
                    break;
                case 'number':
                    fieldSchema = z.number();
                    break;
                case 'checkbox':
                    fieldSchema = z.boolean();
                    break;
                default:
                    fieldSchema = z.string();
            }

            if (field.required) {
                if (
                    field.type === 'text' ||
                    field.type === 'email' ||
                    field.type === 'tel' ||
                    field.type === 'textarea'
                ) {
                    fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`);
                } else if (field.type === 'number') {
                    // Number fields are automatically required if they have a value
                    fieldSchema = fieldSchema;
                }
            } else {
                fieldSchema = fieldSchema.optional();
            }

            if (field.validation) {
                fieldSchema = fieldSchema.and(field.validation);
            }

            schemaFields[field.name] = fieldSchema;
        });

        return z.object(schemaFields);
    }, [fields]);

    const form = useZodForm({
        schema,
        defaultValues: defaultValues as any,
    });

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await onSubmit(data);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderField = (field: ContentFormField) => {
        switch (field.type) {
            case 'textarea':
                return (
                    <FormField
                        key={field.id}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem>
                                <FormLabel>{field.label}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={field.placeholder} {...formField} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );

            case 'select':
                return (
                    <FormField
                        key={field.id}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem>
                                <FormLabel>{field.label}</FormLabel>
                                <Select onValueChange={formField.onChange} value={formField.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={field.placeholder} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {field.options?.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );

            case 'checkbox':
                return (
                    <FormField
                        key={field.id}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                                <FormControl>
                                    <Checkbox checked={formField.value} onCheckedChange={formField.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>{field.label}</FormLabel>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );

            case 'radio':
                return (
                    <FormField
                        key={field.id}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>{field.label}</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={formField.onChange}
                                        value={formField.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        {field.options?.map((option) => (
                                            <FormItem
                                                key={option.value}
                                                className="flex items-center space-y-0 space-x-3"
                                            >
                                                <FormControl>
                                                    <RadioGroupItem value={option.value} />
                                                </FormControl>
                                                <FormLabel className="font-normal">{option.label}</FormLabel>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );

            default:
                return (
                    <FormField
                        key={field.id}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem>
                                <FormLabel>{field.label}</FormLabel>
                                <FormControl>
                                    <Input type={field.type} placeholder={field.placeholder} {...formField} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );
        }
    };

    return (
        <div className={cn('space-y-6', className)} {...props}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    {fields.map(renderField)}

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            aria-label={isLoading ? 'Saving' : mode === 'create' ? 'Create' : 'Save changes'}
                        >
                            {isLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
