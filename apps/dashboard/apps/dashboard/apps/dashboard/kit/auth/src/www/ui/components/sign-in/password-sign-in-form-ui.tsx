'use client';

import { Button } from '@kit/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Icon } from '@kit/ui/icon';
import { PasswordInput } from '@kit/ui/password-input';
import { PrefixSuffixInput } from '@kit/ui/prefix-suffix-input';
import { useZodForm } from '@kit/utils/hooks/use-zod-form';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';
import type { AuthConfig } from '../../../../config';
import { createPasswordSignInSchema } from '../../../../shared/schemas/create-password.schema';

interface PasswordSignInFormUIProps {
    authConfig: AuthConfig;
    onSubmit: (params: z.infer<ReturnType<typeof createPasswordSignInSchema>>) => unknown;
    loading: boolean;
    forgottenPasswordLink: string;
}

export const PasswordSignInFormUI: React.FC<PasswordSignInFormUIProps> = ({
    authConfig,
    onSubmit,
    loading,
    forgottenPasswordLink,
}) => {
    const { t } = useTranslation('p_auth');
    const passwordSignInSchema = createPasswordSignInSchema(authConfig);

    const form = useZodForm({
        schema: passwordSignInSchema,
        defaultValues: {
            email: '',
            password: '',
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
                            <div className="flex flex-row items-center justify-between">
                                <FormLabel>{t('passwordLabel')}</FormLabel>
                                <Link href={forgottenPasswordLink} className="ml-auto inline-block text-sm underline">
                                    {t('passwordForgottenQuestion')}
                                </Link>
                            </div>

                            <FormControl>
                                <PasswordInput
                                    {...field}
                                    autoCapitalize="off"
                                    autoComplete="current-password"
                                    prefix={<Icon name="Lock" className="size-4 shrink-0" />}
                                    disabled={form.formState.isSubmitting}
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    aria-label={t('signInWithEmail')}
                    className="group w-full"
                    type="submit"
                    disabled={!form.formState.isDirty || form.formState.isSubmitting}
                    loading={loading || form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? (
                        t('signingIn')
                    ) : (
                        <>
                            {t('signInWithEmail')}
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
