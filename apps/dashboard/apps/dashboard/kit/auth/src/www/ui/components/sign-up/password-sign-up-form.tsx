'use client';

import { useEmailPasswordSignUp } from '@kit/supabase';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Icon } from '@kit/ui/icon';
import { applyFilter } from '@kit/utils/filters';
import { AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { AuthConfig } from '../../../../config';
import { useCaptchaToken } from '../../../captcha/captcha-provider';
import { AuthErrorAlert } from '../auth-error-alert';
import { PasswordSignUpFormUI } from './password-sign-up-form-ui';
import { motion } from 'motion/react';
import { LoadingOverlay } from '@kit/ui/loading-overlay';

function updateUrlWithStatus(status: string, router: ReturnType<typeof useRouter>) {
    const url = new URL(window.location.href);
    url.searchParams.set('status', status);
    router.replace(url.pathname + url.search);
}

type SignUpFormData = {
    email: string;
    password: string;
};

interface PasswordSignUpFormProps {
    authConfig: AuthConfig;
    defaultValues?: {
        email: string;
    };
    onSignUp?: (userId?: string) => unknown;
    emailRedirectTo: string;
}

export const PasswordSignUpForm: React.FC<PasswordSignUpFormProps> = ({
    authConfig,
    defaultValues,
    onSignUp,
    emailRedirectTo,
}) => {
    const { captchaToken, resetCaptchaToken } = useCaptchaToken();
    const router = useRouter();
    const signUpMutation = useEmailPasswordSignUp();
    const [signedUp, setSignedUp] = useState(false);

    const onSignupRequested = useCallback(
        async (credentials: SignUpFormData) => {
            if (signUpMutation.isPending) {
                return;
            }

            try {
                const data = await signUpMutation.mutateAsync({
                    ...credentials,
                    emailRedirectTo,
                    captchaToken,
                });

                applyFilter('user_signed_up', null, {
                    method: 'password',
                });

                updateUrlWithStatus('success', router);

                if (onSignUp) {
                    onSignUp(data.user?.id);
                }

                setSignedUp(true);
            } catch (error) {
                console.error(error);
                throw error;
            } finally {
                resetCaptchaToken?.();
            }
        },
        [signUpMutation, emailRedirectTo, captchaToken, router, onSignUp, resetCaptchaToken],
    );

    return signUpMutation.isSuccess ? (
        <Alert variant={'success'}>
            <Icon name="CircleCheck" className={'w-4'} />
            <AlertTitle>We sent you a confirmation email.</AlertTitle>
            <AlertDescription>
                Welcome! Please check your email and click the link to verify your account.
            </AlertDescription>
        </Alert>
    ) : (
        <>
            {signedUp && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='fixed top-0 left-0 w-screen h-screen z-200'
                >
                    <LoadingOverlay />
                </motion.div>
            )}

            <AuthErrorAlert error={signUpMutation.error as AuthError | null} />

            <PasswordSignUpFormUI
                authConfig={authConfig}
                onSubmit={onSignupRequested}
                loading={signUpMutation.isPending}
                defaultValues={defaultValues}
            />
        </>
    );
};
