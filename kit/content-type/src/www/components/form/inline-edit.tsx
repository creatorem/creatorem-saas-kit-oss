'use client';

/**
 * Generic inline edit component extracted from:
 *
 * This component provides inline editing functionality with form validation,
 * allowing users to edit content directly in place with save/cancel actions.
 */

import { Button } from '@kit/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';
import { Icon } from '@kit/ui/icon';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { cn } from '@kit/utils';
import { useZodForm } from '@kit/utils/hooks/use-zod-form';
import React from 'react';
import { z } from 'zod';

interface InlineEditProps {
    value: string;
    onSave: (value: string) => Promise<void> | void;
    type?: 'text' | 'textarea' | 'email' | 'tel';
    placeholder?: string;
    className?: string;
    displayClassName?: string;
    required?: boolean;
    validation?: z.ZodString;
}

export function InlineEdit({
    value,
    onSave,
    type = 'text',
    placeholder,
    className,
    displayClassName,
    required = false,
    validation,
}: InlineEditProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const schema = React.useMemo(() => {
        let fieldSchema = z.string();

        if (type === 'email') {
            fieldSchema = fieldSchema.email();
        }

        if (required) {
            fieldSchema = fieldSchema.min(1, 'This field is required');
        }

        if (validation) {
            fieldSchema = validation;
        }

        return z.object({ value: fieldSchema });
    }, [type, required, validation]);

    const form = useZodForm({
        schema,
        defaultValues: { value },
    });

    React.useEffect(() => {
        if (!isEditing) {
            form.reset({ value });
        }
    }, [value, isEditing, form]);

    const handleSave = async (data: { value: string }) => {
        setIsLoading(true);
        try {
            await onSave(data.value);
            setIsEditing(false);
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        form.reset({ value });
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div className={cn('group flex items-center gap-2', className)}>
                <span className={cn('flex-1', displayClassName)}>{value || placeholder}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => setIsEditing(true)}
                    aria-label="Edit"
                >
                    <Icon name="Copy" className="size-3" />
                </Button>
            </div>
        );
    }

    return (
        <div className={cn('space-y-2', className)}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-2">
                    <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    {type === 'textarea' ? (
                                        <Textarea placeholder={placeholder} {...field} autoFocus />
                                    ) : (
                                        <Input type={type} placeholder={placeholder} {...field} autoFocus />
                                    )}
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isLoading}
                            aria-label={isLoading ? 'Saving changes' : 'Save changes'}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            disabled={isLoading}
                            aria-label="Cancel editing"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
