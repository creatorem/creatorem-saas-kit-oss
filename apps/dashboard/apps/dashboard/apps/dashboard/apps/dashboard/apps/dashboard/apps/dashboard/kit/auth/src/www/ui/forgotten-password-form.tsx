'use client';

import { useForgottenPasswordEmailSender } from '@kit/supabase';
import { Alert, AlertDescription } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Icon } from '@kit/ui/icon';
import { PrefixSuffixInput } from '@kit/ui/prefix-suffix-input';
import { useZodForm } from '@kit/utils/hooks/use-zod-form';

import { AuthError } from '@supabase/supabase-js';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCaptchaToken } from '../captcha/captcha-provider';
import { AuthErrorAlert } from './components/auth-error-alert';

const passwordResetSchema = z.object({
    email: z.string().email(),
});

export function ForgottenPasswordForm(params: { redirectPath: string }) {
    const { t } = useTranslation('p_auth');
    const forgottenPasswordEmailSender = useForgottenPasswordEmailSender();
    const { captchaToken, resetCaptchaToken } = useCaptchaToken();

    const form = useZodForm({
        schema: passwordResetSchema,
        defaultValues: {
            email: '',
        },
    });

    const handleSubmit = useCallback(
        async ({ email }: z.infer<typeof passwordResetSchema>) => {
            const redirectTo = new URL(params.redirectPath, window.location.origin).href;

            try {
                await forgottenPasswordEmailSender.mutateAsync({
                    email,
                    redirectTo,
                    captchaToken,
                });
                toast.success(t('passwordResetToast'));
            } catch (error) {
                console.error('Password reset error', error);
                resetCaptchaToken();
            }
        },
        [params.redirectPath, forgottenPasswordEmailSender, captchaToken, resetCaptchaToken],
    );

    return (
        <>
            {forgottenPasswordEmailSender.data && (
                <Alert variant={'success'}>
                    <Icon name="Check" className="size-4 shrink-0" />
                    <AlertDescription>{t('passwordResetSuccess')}</AlertDescription>
                </Alert>
            )}

            {!forgottenPasswordEmailSender.data && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className={'w-full'}>
                        <div className={'flex flex-col gap-4'}>
                            <AuthErrorAlert error={forgottenPasswordEmailSender.error as AuthError | null} />

                            <FormField
                                name={'email'}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('emailLabel')}</FormLabel>

                                        <FormControl>
                                            <PrefixSuffixInput
                                                {...field}
                                                type="email"
                                                placeholder={t('emailPlaceholder')}
                                                maxLength={255}
                                                autoCapitalize="off"
                                                autoComplete="username"
                                                prefix={<Icon name="Mail" className="size-4 shrink-0" />}
                                                disabled={form.formState.isSubmitting}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                disabled={!form.formState.isDirty || form.formState.isSubmitting}
                                type="submit"
                                aria-label={t('resetPasswordButton')}
                            >
                                {form.formState.isSubmitting ? t('resettingPassword') : t('resetPasswordButton')}
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </>
    );
}
