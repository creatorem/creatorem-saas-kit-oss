'use client';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Icon } from '@kit/ui/icon';
import { PasswordInput } from '@kit/ui/password-input';
import { toast } from '@kit/ui/sonner';
import { cn } from '@kit/utils';
import { useTranslation } from 'react-i18next';
import type { AuthConfig } from '../../config';
import { useUpdatePassword } from '../../shared/hooks/use-update-password';

interface UpdatePasswordFormProps {
    authConfig: AuthConfig;
    beforeSubmit?: (data: { password: string; repeatPassword: string }) => Promise<void>;
    afterSubmit?: (data: { password: string; repeatPassword: string }) => Promise<void>;
    className?: string;
}

export function UpdatePasswordForm({ authConfig, className, beforeSubmit, afterSubmit }: UpdatePasswordFormProps) {
    const { form, handleSubmit, updateUser, needsReauthentication } = useUpdatePassword({
        authConfig,
        beforeSubmit,
        afterSubmit,
        toast,
    });

    const { t } = useTranslation('p_auth');

    if (updateUser.data && !updateUser.isPending) {
        return (
            <Alert variant={'success'}>
                <Icon name="Check" />
                <AlertTitle>{t('updatePasswordSuccessTitle')}</AlertTitle>
                <AlertDescription>{t('updatePasswordSuccessDescription')}</AlertDescription>
            </Alert>
        );
    }

    return (
        <>
            {(needsReauthentication || updateUser.error) && (
                <Alert variant="warning" className="mb-6">
                    <Icon name="AlertCircle" className="size-4 shrink-0" />
                    <AlertDescription className="text-sm">{t('reauthenticationRequired')}</AlertDescription>
                </Alert>
            )}
            <Form {...form}>
                <form className={cn('', className)} onSubmit={form.handleSubmit(handleSubmit)}>
                    <div className={'flex-col space-y-4'}>
                        <FormField
                            control={form.control}
                            name={'password'}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('passwordLabel')}</FormLabel>

                                    <FormControl>
                                        <PasswordInput
                                            {...field}
                                            maxLength={72}
                                            autoCapitalize="off"
                                            autoComplete="current-password"
                                            prefix={<Icon name="Lock" className="size-4 shrink-0" />}
                                            disabled={updateUser.isPending || form.formState.isSubmitting}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={'repeatPassword'}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('repeatPasswordLabel')}</FormLabel>

                                    <FormControl>
                                        <PasswordInput
                                            {...field}
                                            maxLength={72}
                                            autoCapitalize="off"
                                            autoComplete="current-password"
                                            prefix={<Icon name="Lock" className="size-4 shrink-0" />}
                                            disabled={updateUser.isPending || form.formState.isSubmitting}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            aria-label={t('updatePasswordButton')}
                            disabled={!form.formState.isDirty || form.formState.isSubmitting}
                            loading={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? t('updatingPassword') : t('updatePasswordButton')}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
