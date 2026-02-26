'use client';

import { useEmailPasswordSignIn } from '@kit/supabase';
import { AuthError } from '@supabase/supabase-js';
import { useCallback, useState } from 'react';
import type { z } from 'zod';
import type { AuthConfig } from '../../../../config';
import { createPasswordSignInSchema } from '../../../../shared/schemas/create-password.schema';
import { useCaptchaToken } from '../../../captcha/captcha-provider';
import { AuthErrorAlert } from '../auth-error-alert';
import { motion } from 'motion/react'
import { PasswordSignInFormUI } from './password-sign-in-form-ui';
import { LoadingOverlay } from '@kit/ui/loading-overlay';

interface PasswordSignInFormProps {
    authConfig: AuthConfig;
    onSignIn?: (userId?: string) => unknown;
    forgottenPasswordLink: string;
}

export const PasswordSignInForm: React.FC<PasswordSignInFormProps> = ({
    authConfig,
    onSignIn,
    forgottenPasswordLink,
}) => {
    const { captchaToken, resetCaptchaToken } = useCaptchaToken();
    const signInMutation = useEmailPasswordSignIn();
    const isLoading = signInMutation.isPending;
    const passwordSignInSchema = createPasswordSignInSchema(authConfig);
    const [signedIn, setSignedIn] = useState(false);

    const onSubmit = useCallback(
        async (credentials: z.infer<typeof passwordSignInSchema>) => {
            try {
                const data = await signInMutation.mutateAsync({
                    ...credentials,
                    options: { captchaToken },
                });

                if (onSignIn) {
                    const userId = data?.user?.id;

                    onSignIn(userId);
                }
                setSignedIn(true);
            } catch {
                // wrong credentials, do nothing
            } finally {
                resetCaptchaToken();
            }
        },
        [captchaToken, onSignIn, resetCaptchaToken, signInMutation, passwordSignInSchema],
    );

    return (
        <>
            {signedIn && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='fixed top-0 left-0 w-screen h-screen z-200'
                >
                    <LoadingOverlay />
                </motion.div>
            )}

            <AuthErrorAlert error={signInMutation.error as AuthError | null} />

            <PasswordSignInFormUI
                authConfig={authConfig}
                onSubmit={onSubmit}
                loading={isLoading}
                forgottenPasswordLink={forgottenPasswordLink}
            />
        </>
    );
};
