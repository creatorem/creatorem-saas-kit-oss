import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Icon } from '@kit/ui/icon';
import { AuthError } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

export function AuthErrorAlert({ error }: { error: AuthError | null | undefined | string }) {
    const { t } = useTranslation('p_auth');

    if (!error) {
        return null;
    }

    const errorCode: AuthError['code'] = error instanceof AuthError ? error.code : undefined;

    return (
        <Alert variant={'destructive'}>
            <Icon name="Circle" className={'size-4'} />

            <AlertTitle>{t('errorAlertTitle')}</AlertTitle>

            <AlertDescription>
                {errorCode
                    ? t(`errors.supabase.${errorCode}` as any)
                    : t('errors.default') +
                      (error instanceof Error && 'message' in error && typeof error.message === 'string'
                          ? ` ${error.message}`
                          : '')}
            </AlertDescription>
        </Alert>
    );
}
