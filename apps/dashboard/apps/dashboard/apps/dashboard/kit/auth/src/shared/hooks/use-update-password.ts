// import { useLangUrl } from '@kit/i18n/hooks/use-lang-url';
import type { toast as rnToast } from '@kit/native-ui/sonner';
import { useAuthUserUpdater } from '@kit/supabase';
import type { toast as wwwToast } from '@kit/ui/sonner';
import { useApplyFilter } from '@kit/utils/filters';
import { useZodForm } from '@kit/utils/hooks/use-zod-form';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { AuthConfig } from '../../config';
import { createPasswordResetSchema } from '../../shared/schemas/create-password.schema';

export const useUpdatePassword = ({
    toast,
    authConfig,
    beforeSubmit,
    afterSubmit,
}: {
    authConfig: AuthConfig;
    beforeSubmit?: (data: { password: string; repeatPassword: string }) => Promise<void>;
    afterSubmit?: (data: { password: string; repeatPassword: string }) => Promise<void>;
    toast: typeof rnToast | typeof wwwToast;
}) => {
    const { t } = useTranslation('p_auth');
    const updateUser = useAuthUserUpdater();
    const passwordResetSchema = useMemo(() => createPasswordResetSchema(authConfig, t), [authConfig, t]);
    const [needsReauthentication, setNeedsReauthentication] = useState(false);
    const url = useApplyFilter('get_url_updater', (u) => u);

    const form = useZodForm({
        schema: passwordResetSchema,
        mode: 'onChange',
        defaultValues: {
            password: '',
            repeatPassword: '',
        },
    });

    const handleSubmit = useCallback(
        async (data: z.infer<typeof passwordResetSchema>) => {
            if (beforeSubmit) {
                await beforeSubmit(data);
            }

            try {
                await updateUser.mutateAsync({
                    password: data.password,
                    redirectTo: url(authConfig.urls.callback),
                });
                toast.success(t('updatePasswordSuccess'));
                form.reset();
                setNeedsReauthentication(false);

                if (afterSubmit) {
                    await afterSubmit(data);
                }
            } catch (error: any) {
                console.log('Reset password error', error);
                if (typeof error === 'string' && error?.includes('Password update requires reauthentication')) {
                    setNeedsReauthentication(true);
                } else {
                    toast.error(t('updatePasswordError'));
                }
            }
        },
        [authConfig.urls.callback, form, updateUser, beforeSubmit, afterSubmit],
    );

    return {
        form,
        handleSubmit,
        updateUser,
        needsReauthentication,
    };
};
