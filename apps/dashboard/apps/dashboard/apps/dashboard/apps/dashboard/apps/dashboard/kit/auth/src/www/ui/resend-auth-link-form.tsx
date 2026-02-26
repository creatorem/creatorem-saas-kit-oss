'use client';

import { useSupabase } from '@kit/supabase';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@kit/ui/form';
import { Icon } from '@kit/ui/icon';
import { PrefixSuffixInput } from '@kit/ui/prefix-suffix-input';
import { useZodForm } from '@kit/utils/hooks/use-zod-form';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCaptchaToken } from '../captcha/captcha-provider';

const resendLinkSchema = z.object({
    email: z.string().email(),
});

export function ResendAuthLinkForm(props: { redirectPath?: string }) {
    const { t } = useTranslation('p_auth');
    const resendLink = useResendLink();

    const form = useZodForm({
        schema: resendLinkSchema,
        defaultValues: {
            email: '',
        },
    });

    if (resendLink.data && !resendLink.isPending) {
        return (
            <Alert variant={'success'}>
                <Icon name="Check" className="size-4 shrink-0" />
                <AlertTitle>{t('resendLinkSuccessTitle')}</AlertTitle>

                <AlertDescription>{t('resendLinkSuccessDescription')}</AlertDescription>
            </Alert>
        );
    }

    const handleSubmit = useCallback(
        async (data: z.infer<typeof resendLinkSchema>) => {
            try {
                await resendLink.mutateAsync({
                    email: data.email,
                    redirectPath: props.redirectPath,
                });
                toast.success(t('resendLinkToastSuccess'));
            } catch (error) {
                console.error('Resend auth link error', error);
                toast.error(t('resendLinkToastError'));
            }
        },
        [resendLink, props.redirectPath],
    );

    return (
        <Form {...form}>
            <form className={'flex flex-col space-y-2'} onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField
                    render={({ field }) => {
                        return (
                            <FormItem>
                                <FormLabel>{t('emailLabel')}</FormLabel>

                                <FormControl>
                                    <PrefixSuffixInput
                                        {...field}
                                        type="email"
                                        placeholder={t('emailPlaceholder')}
                                        autoCapitalize="off"
                                        autoComplete="username"
                                        prefix={<Icon name="Mail" className="size-4 shrink-0" />}
                                        disabled={form.formState.isSubmitting}
                                    />
                                </FormControl>
                            </FormItem>
                        );
                    }}
                    name={'email'}
                />

                <Button
                    disabled={!form.formState.isDirty || form.formState.isSubmitting}
                    aria-label={t('resendLinkButton')}
                >
                    {form.formState.isSubmitting ? t('sendingLink') : t('resendLinkButton')}
                </Button>
            </form>
        </Form>
    );
}

function useResendLink() {
    const supabase = useSupabase();
    const { captchaToken } = useCaptchaToken();

    const mutationFn = async (props: { email: string; redirectPath?: string }) => {
        const response = await supabase.auth.resend({
            email: props.email,
            type: 'signup',
            options: {
                emailRedirectTo: props.redirectPath,
                captchaToken,
            },
        });

        if (response.error) {
            throw response.error;
        }

        return response.data;
    };

    return useMutation({
        mutationFn,
    });
}
