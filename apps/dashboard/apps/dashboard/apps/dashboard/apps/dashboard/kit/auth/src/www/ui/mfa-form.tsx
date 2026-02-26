'use client';

import { useAuthFactorsList, useSignOut, useSupabase } from '@kit/supabase';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@kit/ui/field';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';
import { Icon } from '@kit/ui/icon';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@kit/ui/input-otp';
import { Spinner } from '@kit/ui/spinner';
import { useZodForm } from '@kit/utils/hooks/use-zod-form';
import { AuthError, Factor } from '@supabase/supabase-js';
import { UseMutationResult, useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

const mfaFormSchema = z.object({
    factorId: z.string().min(1),
    verificationCode: z.string().min(6).max(6),
});

type MfaFormSchema = z.infer<typeof mfaFormSchema>;

export function MfaForm({
    paths,
    userId,
}: React.PropsWithChildren<{
    userId: string;
    paths: {
        redirectPath: string;
    };
}>) {
    const verifyMFAChallenge = useVerifyMFAChallenge({
        onSuccess: () => {
            window.location.replace(paths.redirectPath);
        },
    });

    const verificationCodeForm = useZodForm({
        schema: mfaFormSchema,
        defaultValues: {
            factorId: '',
            verificationCode: '',
        },
    });

    const factorId = useWatch({
        name: 'factorId',
        control: verificationCodeForm.control,
    });

    if (!factorId) {
        return <FactorSelection userId={userId} verificationCodeForm={verificationCodeForm} />;
    }

    return (
        <VerificationForm
            verificationCodeForm={verificationCodeForm}
            verifyMFAChallenge={verifyMFAChallenge}
            factorId={factorId}
        />
    );
}

function FactorSelection({
    userId,
    verificationCodeForm,
}: {
    userId: string;
    verificationCodeForm: UseFormReturn<MfaFormSchema>;
}) {
    return (
        <FactorsListContainer
            userId={userId}
            onSelect={(factorId) => {
                verificationCodeForm.setValue('factorId', factorId);
            }}
        />
    );
}

function VerificationForm({
    verificationCodeForm,
    verifyMFAChallenge,
    factorId,
}: {
    verificationCodeForm: UseFormReturn<MfaFormSchema>;
    verifyMFAChallenge: ReturnType<typeof useVerifyMFAChallenge>;
    factorId: string;
}) {
    const { t } = useTranslation('p_auth');

    return (
        <div className={'flex flex-col gap-6'}>
            <Form {...verificationCodeForm}>
                <form
                    className={'flex w-full flex-col items-center justify-center gap-4'}
                    onSubmit={verificationCodeForm.handleSubmit(async (data: MfaFormSchema) => {
                        try {
                            await verifyMFAChallenge.mutateAsync({
                                factorId,
                                verificationCode: data.verificationCode,
                            });
                            toast.success(t('verifyMfaCodeSuccess'));
                        } catch (error) {
                            console.error('MFA verification error', error);
                            toast.error(t('verifyMfaCodeError'));
                        }
                    })}
                >
                    <FieldGroup>
                        <div className="flex flex-col items-center gap-2 text-center">
                            <h1 className="text-xl font-bold">Enter verification code</h1>
                            <FieldDescription>A 6-digit code is required.</FieldDescription>
                        </div>
                        <VerificationCodeSection verifyMFAChallenge={verifyMFAChallenge} />
                        <Field>
                            <SubmitButton form={verificationCodeForm} />
                        </Field>
                    </FieldGroup>
                </form>
            </Form>
        </div>
    );
}

function VerificationCodeSection({
    verifyMFAChallenge,
}: {
    verifyMFAChallenge: ReturnType<typeof useVerifyMFAChallenge>;
}) {
    const { t } = useTranslation('p_auth');

    return (
        <>
            <Field>
                <FieldLabel htmlFor="otp" className="sr-only">
                    Verification code
                </FieldLabel>

                <FormField
                    name={'verificationCode'}
                    render={({ field }) => {
                        return (
                            <FormItem className={'mx-auto flex flex-col items-center justify-center'}>
                                <FormControl>
                                    <InputOTP {...field} maxLength={6} minLength={6}>
                                        <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                        </InputOTPGroup>
                                        <InputOTPSeparator />
                                        <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />

                <FieldDescription className="text-center">{t('verificationCodeHint')}</FieldDescription>
            </Field>

            {verifyMFAChallenge.error && <ErrorAlert />}
        </>
    );
}

function ErrorAlert() {
    const { t } = useTranslation('p_auth');
    return (
        <Alert variant={'destructive'}>
            <Icon name="TriangleAlert" className={'h-5'} />

            <AlertTitle>{t('authenticationErrorAlertHeading')}</AlertTitle>

            <AlertDescription>{t('verifyMfaCodeError')}</AlertDescription>
        </Alert>
    );
}

function SubmitButton({ form }: { form: UseFormReturn<MfaFormSchema> }) {
    const { t } = useTranslation('p_auth');
    return (
        <Button
            aria-label={form.formState.isSubmitting ? t('verifyingMfaCode') : t('verificationCodeSubmitButtonLabel')}
            disabled={!form.formState.isDirty}
            loading={form.formState.isSubmitting}
        >
            {t('verificationCodeSubmitButtonLabel')}
        </Button>
    );
}

function useVerifyMFAChallenge({ onSuccess }: { onSuccess: () => void }) {
    const client = useSupabase();
    const mutationKey = ['mfa-verify-challenge'];

    const mutationFn = async (params: { factorId: string; verificationCode: string }) => {
        const { factorId, verificationCode: code } = params;

        const response = await client.auth.mfa.challengeAndVerify({
            factorId,
            code,
        });

        if (response.error) {
            throw response.error;
        }

        return response.data;
    };

    return useMutation({ mutationKey, mutationFn, onSuccess });
}

function FactorsListContainer({
    onSelect,
    userId,
}: React.PropsWithChildren<{
    userId: string;
    onSelect: (factor: string) => void;
}>) {
    const signOut = useSignOut();
    const { data: factors, isLoading, error } = useAuthFactorsList(userId);

    const isSuccess = Boolean(factors && !isLoading && !error);

    useHandleFactorsError(error, signOut);
    useAutoSelectSingleFactor(isSuccess, factors, onSelect);

    if (isLoading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState />;
    }

    const verifiedFactors = factors?.totp ?? [];
    return <FactorsList verifiedFactors={verifiedFactors} onSelect={onSelect} />;
}

function useHandleFactorsError(
    error: Error | null,
    signOut: UseMutationResult<
        {
            error: AuthError | null;
        },
        Error,
        void,
        unknown
    >,
) {
    useEffect(() => {
        if (error) {
            void signOut.mutateAsync();
        }
    }, [error, signOut]);
}

function useAutoSelectSingleFactor(
    isSuccess: boolean,
    factors:
        | {
              all: Factor[];
              totp: Factor[];
              phone: Factor[];
          }
        | undefined,
    onSelect: (factorId: string) => void,
) {
    useEffect(() => {
        if (isSuccess && factors?.totp.length === 1) {
            const factorId = factors.totp[0]?.id;
            if (factorId) {
                onSelect(factorId);
            }
        }
    }, [isSuccess, factors, onSelect]);
}

function LoadingState() {
    const { t } = useTranslation('p_auth');
    return (
        <div className={'flex flex-col items-center space-y-4 py-8'}>
            <Spinner />
            <div>{t('mfaLoadingFactors')}</div>
        </div>
    );
}

function ErrorState() {
    const { t } = useTranslation('p_auth');
    return (
        <div className={'w-full'}>
            <Alert variant={'destructive'}>
                <Icon name="TriangleAlert" className={'h-4'} />

                <AlertTitle>{t('mfaErrorLoadingFactorsTitle')}</AlertTitle>

                <AlertDescription>{t('mfaErrorLoadingFactorsDescription')}</AlertDescription>
            </Alert>
        </div>
    );
}

function FactorsList({
    verifiedFactors,
    onSelect,
}: {
    verifiedFactors: Factor[];
    onSelect: (factorId: string) => void;
}) {
    const { t } = useTranslation('p_auth');
    return (
        <div className={'flex flex-col space-y-4'}>
            <div>
                <span className={'font-medium'}>{t('mfaChooseFactorHeading')}</span>
            </div>

            <div className={'flex flex-col space-y-2'}>
                {verifiedFactors.map((factor) => (
                    <FactorButton key={factor.id} factor={factor} onSelect={onSelect} />
                ))}
            </div>
        </div>
    );
}

function FactorButton({ factor, onSelect }: { factor: Factor; onSelect: (factorId: string) => void }) {
    const { t } = useTranslation('p_auth');
    return (
        <div key={factor.id}>
            <Button
                aria-label={t('mfaSelectFactorAriaLabel', { name: factor.friendly_name })}
                variant={'outline'}
                className={'w-full'}
                onClick={() => onSelect(factor.id)}
            >
                {factor.friendly_name}
            </Button>
        </div>
    );
}
