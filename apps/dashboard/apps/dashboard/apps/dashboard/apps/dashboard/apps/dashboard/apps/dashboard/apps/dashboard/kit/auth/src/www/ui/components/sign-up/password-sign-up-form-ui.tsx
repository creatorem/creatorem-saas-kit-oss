'use client';

import { Button } from '@kit/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Icon } from '@kit/ui/icon';
import { PasswordInput } from '@kit/ui/password-input';
import { PrefixSuffixInput } from '@kit/ui/prefix-suffix-input';
import { useZodForm } from '@kit/utils/hooks/use-zod-form';
import { useTranslation } from 'react-i18next';
import type { AuthConfig } from '../../../../config';
import { createPasswordSignUpSchema } from '../../../../shared/schemas/create-password.schema';
import { TermsCheckbox } from '../terms-checkbox';

interface PasswordSignUpFormUIProps {
    authConfig: AuthConfig;
    defaultValues?: {
        email: string;
    };
    onSubmit: (params: { email: string; password: string; repeatPassword: string }) => unknown;
    loading: boolean;
}

export const PasswordSignUpFormUI: React.FC<PasswordSignUpFormUIProps> = ({
    authConfig,
    defaultValues,
    onSubmit,
    loading,
}) => {
    const { t } = useTranslation('p_auth');
    const passwordSignUpSchema = createPasswordSignUpSchema(authConfig, t);

    const form = useZodForm({
        schema: passwordSignUpSchema,
        defaultValues: {
            email: defaultValues?.email ?? '',
            password: '',
            repeatPassword: '',
        },
    });

    return (
        <Form {...form}>
            <form className={'flex w-full flex-col gap-4'} onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name={'email'}
                    render={({ field }) => (
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

                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                                    autoComplete="new-password"
                                    prefix={<Icon name="Lock" className="size-4 shrink-0" />}
                                    disabled={form.formState.isSubmitting}
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
                            <FormLabel>{t('repeatPassword')}</FormLabel>

                            <FormControl>
                                <PasswordInput
                                    {...field}
                                    maxLength={72}
                                    autoCapitalize="off"
                                    autoComplete="new-password"
                                    prefix={<Icon name="Lock" className="size-4 shrink-0" />}
                                    disabled={form.formState.isSubmitting}
                                />
                            </FormControl>

                            <FormMessage />

                            <FormDescription className={'pb-2 text-xs'}>{t('repeatPasswordHint')}</FormDescription>
                        </FormItem>
                    )}
                />

                {authConfig.displayTermsCheckbox && <TermsCheckbox />}

                <Button
                    aria-label={t('signUpWithEmail')}
                    className="w-full"
                    type="submit"
                    disabled={!form.formState.isDirty || form.formState.isSubmitting}
                    loading={loading || form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? (
                        t('signingUp')
                    ) : (
                        <>
                            {t('signUpWithEmail')}
                            <Icon
                                name="ChevronRight"
                                className={
                                    'zoom-in animate-in slide-in-from-left-2 fill-mode-both h-4 delay-500 duration-500'
                                }
                            />
                        </>
                    )}
                </Button>
            </form>
        </Form>
    );
};
