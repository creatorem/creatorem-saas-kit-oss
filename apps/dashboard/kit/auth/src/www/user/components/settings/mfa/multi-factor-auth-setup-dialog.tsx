'use client';

import { getMfaMutationKey, useSupabase } from '@kit/supabase';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@kit/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Icon } from '@kit/ui/icon';
import { Input } from '@kit/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@kit/ui/input-otp';
import { QRCode, QRCodeFrame, QRCodeOverlay, QRCodePattern } from '@kit/ui/qr-code';
import { useZodForm } from '@kit/utils/hooks/use-zod-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { refreshAuthSession } from '../../../actions/refresh-auth-session';

export function MultiFactorAuthSetupDialog(props: { userId: string }) {
    const { t } = useTranslation('p_auth');
    const [isOpen, setIsOpen] = useState(false);

    const onEnrollSuccess = useCallback(() => {
        setIsOpen(false);

        return toast.success(t('multiFactorSetupSuccess'));
    }, [t]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button aria-label={t('setupMfa')}>{t('setupNewFactor')}</Button>
            </DialogTrigger>

            <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{t('setupNewFactor')}</DialogTitle>

                    <DialogDescription>{t('setupMfaDescription')}</DialogDescription>
                </DialogHeader>

                <div>
                    <MultiFactorAuthSetupForm
                        userId={props.userId}
                        onCancel={() => setIsOpen(false)}
                        onEnrolled={onEnrollSuccess}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

function MultiFactorAuthSetupForm({
    onEnrolled,
    onCancel,
    userId,
}: React.PropsWithChildren<{
    userId: string;
    onCancel: () => void;
    onEnrolled: () => void;
}>) {
    const { t } = useTranslation('p_auth');
    const verifyCodeMutation = useVerifyCodeMutation(userId);

    const verificationCodeForm = useZodForm({
        schema: z.object({
            factorId: z.string().min(1),
            verificationCode: z.string().min(6).max(6),
        }),
        defaultValues: {
            factorId: '',
            verificationCode: '',
        },
    });

    const [state, setState] = useState({
        loading: false,
        error: '',
    });

    const factorId = useWatch({
        name: 'factorId',
        control: verificationCodeForm.control,
    });

    const onSubmit = useCallback(
        async ({ verificationCode, factorId }: { verificationCode: string; factorId: string }) => {
            setState({
                loading: true,
                error: '',
            });

            try {
                await verifyCodeMutation.mutateAsync({
                    factorId,
                    code: verificationCode,
                });

                await refreshAuthSession();

                setState({
                    loading: false,
                    error: '',
                });

                onEnrolled();
            } catch (error) {
                const message = (error as Error).message || `Unknown error`;

                setState({
                    loading: false,
                    error: message,
                });
            }
        },
        [onEnrolled, verifyCodeMutation],
    );

    if (state.error) {
        return <ErrorAlert />;
    }

    return (
        <div className={'flex flex-col space-y-4'}>
            <div className={'flex justify-center'}>
                <FactorQrCode
                    userId={userId}
                    onCancel={onCancel}
                    onSetFactorId={(factorId) => verificationCodeForm.setValue('factorId', factorId)}
                />
            </div>

            {factorId && (
                <Form {...verificationCodeForm}>
                    <form onSubmit={verificationCodeForm.handleSubmit(onSubmit)} className={'w-full'}>
                        <div className={'flex flex-col space-y-8'}>
                            <FormField
                                render={({ field }) => {
                                    return (
                                        <FormItem className={'mx-auto flex flex-col items-center justify-center'}>
                                            <FormControl>
                                                <InputOTP {...field} maxLength={6} minLength={6}>
                                                    <InputOTPGroup>
                                                        <InputOTPSlot index={0} />
                                                        <InputOTPSlot index={1} />
                                                        <InputOTPSlot index={2} />
                                                    </InputOTPGroup>
                                                    <InputOTPSeparator />
                                                    <InputOTPGroup>
                                                        <InputOTPSlot index={3} />
                                                        <InputOTPSlot index={4} />
                                                        <InputOTPSlot index={5} />
                                                    </InputOTPGroup>
                                                </InputOTP>
                                            </FormControl>

                                            <FormDescription>{t('enterVerificationCode')}</FormDescription>

                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                                name={'verificationCode'}
                            />

                            <div className={'flex justify-end space-x-2'}>
                                <Button
                                    type={'button'}
                                    variant={'ghost'}
                                    onClick={onCancel}
                                    aria-label={t('cancelAriaLabel')}
                                >
                                    {t('cancel')}
                                </Button>

                                <Button
                                    disabled={
                                        !verificationCodeForm.formState.isDirty ||
                                        verificationCodeForm.formState.isSubmitting
                                    }
                                    type={'submit'}
                                    aria-label={t('enableMfaFactorAriaLabel')}
                                >
                                    {verificationCodeForm.formState.isSubmitting
                                        ? t('verifyingCode')
                                        : t('enableFactor')}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    );
}

function FactorQrCode({
    onSetFactorId,
    onCancel,
    userId,
}: React.PropsWithChildren<{
    userId: string;
    onCancel: () => void;
    onSetFactorId: (factorId: string) => void;
}>) {
    const enrollFactorMutation = useEnrollFactor(userId);
    const { t } = useTranslation('p_auth');
    const [error, setError] = useState<string>('');

    const form = useZodForm({
        schema: z.object({
            factorName: z.string().min(1),
            qrCodeURI: z.string().min(1),
        }),
        defaultValues: {
            factorName: '',
            qrCodeURI: '',
        },
    });

    const factorName = useWatch({ name: 'factorName', control: form.control });

    if (error) {
        return (
            <div className={'flex w-full flex-col space-y-2'}>
                <Alert variant={'destructive'}>
                    <Icon name="TriangleAlert" className={'h-4'} />

                    <AlertTitle>{t('qrCodeError')}</AlertTitle>

                    <AlertDescription>{t('qrCodeErrorDescription')}</AlertDescription>
                </Alert>

                <div>
                    <Button variant={'outline'} onClick={onCancel} aria-label={t('retry')}>
                        <Icon name="ArrowLeft" className={'h-4'} />
                        {t('retry')}
                    </Button>
                </div>
            </div>
        );
    }

    if (!factorName) {
        return (
            <FactorNameForm
                onCancel={onCancel}
                onSetFactorName={async (name) => {
                    const response = await enrollFactorMutation.mutateAsync(name);

                    if (!response.success) {
                        return setError(response.data as string);
                    }

                    const data = response.data;

                    if (data.type === 'totp') {
                        form.setValue('factorName', name);
                        form.setValue('qrCodeURI', data.totp.uri);
                    }

                    // dispatch event to set factor ID
                    onSetFactorId(data.id);
                }}
            />
        );
    }

    return (
        <div className={'dark:bg-secondary flex flex-col space-y-4 rounded-lg border p-4'}>
            <p>
                <span className={'text-muted-foreground text-sm'}>{t('qrCodeInstructions')}</span>
            </p>

            <div className={'flex justify-center'}>
                <QrImage src={form.getValues('qrCodeURI')} />
            </div>
        </div>
    );
}

function FactorNameForm(
    props: React.PropsWithChildren<{
        onSetFactorName: (name: string) => void;
        onCancel: () => void;
    }>,
) {
    const { t } = useTranslation('p_auth');
    const form = useZodForm({
        schema: z.object({
            name: z.string().min(1),
        }),
        defaultValues: {
            name: '',
        },
    });

    return (
        <Form {...form}>
            <form
                className={'w-full'}
                onSubmit={form.handleSubmit((data) => {
                    props.onSetFactorName(data.name);
                })}
            >
                <div className={'flex flex-col space-y-4'}>
                    <FormField
                        name={'name'}
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <FormLabel>{t('factorNameLabel')}</FormLabel>

                                    <FormControl>
                                        <Input autoComplete={'off'} disabled={form.formState.isSubmitting} {...field} />
                                    </FormControl>

                                    <FormDescription>{t('factorNameDescription')}</FormDescription>

                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />

                    <div className={'flex justify-end space-x-2'}>
                        <Button
                            type={'button'}
                            variant={'ghost'}
                            onClick={props.onCancel}
                            aria-label={t('cancelAriaLabel')}
                        >
                            {t('cancel')}
                        </Button>

                        <Button
                            disabled={!form.formState.isDirty || form.formState.isSubmitting}
                            type={'submit'}
                            aria-label={t('enableMfaFactorAriaLabel')}
                        >
                            {form.formState.isSubmitting ? t('settingFactorName') : t('setFactorName')}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}

function QrImage({ src }: { src: string }) {
    return (
        <QRCode value={src} pixelSize={4} errorCorrectionLevel="M">
            <div className="flex w-48 flex-col gap-4">
                <QRCodeFrame className="outline-border rounded-md outline">
                    <QRCodePattern />
                    <QRCodeOverlay size="lg" className="bg-primary text-white border-4 inset-shadow-2xs">
                        <svg
                            width="2571"
                            height="2571"
                            viewBox="0 0 2571 2571"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="scale-70"
                        >
                            <path
                                d="M1285.5 695.844C1285.5 1021.78 1021.22 1286 695.219 1286H104.938V695.844C104.938 369.909 369.216 105.688 695.219 105.688C1021.22 105.688 1285.5 369.909 1285.5 695.844Z"
                                fill="currentColor"
                            />
                            <path
                                d="M1285.5 1876.16C1285.5 1550.22 1549.78 1286 1875.78 1286H2466.06V1876.16C2466.06 2202.09 2201.78 2466.31 1875.78 2466.31C1549.78 2466.31 1285.5 2202.09 1285.5 1876.16Z"
                                fill="currentColor"
                            />
                            <path
                                d="M104.938 1876.16C104.938 2202.09 369.216 2466.31 695.219 2466.31H1285.5V1876.16C1285.5 1550.22 1021.22 1286 695.219 1286C369.216 1286 104.938 1550.22 104.938 1876.16Z"
                                fill="currentColor"
                            />
                            <path
                                d="M2466.06 695.844C2466.06 369.909 2201.78 105.688 1875.78 105.688H1285.5V695.844C1285.5 1021.78 1549.78 1286 1875.78 1286C2201.78 1286 2466.06 1021.78 2466.06 695.844Z"
                                fill="currentColor"
                            />
                            <circle cx="695" cy="696" r="330" className="fill-primary" />
                        </svg>
                    </QRCodeOverlay>
                </QRCodeFrame>
            </div>
        </QRCode>
    );
}

function useEnrollFactor(userId: string) {
    const client = useSupabase();
    const queryClient = useQueryClient();
    const mutationKey = getMfaMutationKey(userId);

    const mutationFn = async (factorName: string) => {
        const response = await client.auth.mfa.enroll({
            friendlyName: factorName,
            factorType: 'totp',
        });

        if (response.error) {
            return {
                success: false as const,
                data: response.error.code,
            };
        }

        return {
            success: true as const,
            data: response.data,
        };
    };

    return useMutation({
        mutationFn,
        mutationKey,
        onSuccess() {
            return queryClient.refetchQueries({
                queryKey: mutationKey,
            });
        },
    });
}

function useVerifyCodeMutation(userId: string) {
    const mutationKey = getMfaMutationKey(userId);
    const client = useSupabase();
    const queryClient = useQueryClient();

    const mutationFn = async (params: { factorId: string; code: string }) => {
        const challenge = await client.auth.mfa.challenge({
            factorId: params.factorId,
        });

        if (challenge.error) {
            throw challenge.error;
        }

        const challengeId = challenge.data.id;

        const verify = await client.auth.mfa.verify({
            factorId: params.factorId,
            code: params.code,
            challengeId,
        });

        if (verify.error) {
            throw verify.error;
        }

        return verify;
    };

    return useMutation({
        mutationKey,
        mutationFn,
        onSuccess: () => {
            return queryClient.refetchQueries({ queryKey: mutationKey });
        },
    });
}

function ErrorAlert() {
    const { t } = useTranslation('p_auth');
    return (
        <Alert variant={'destructive'}>
            <Icon name="TriangleAlert" className={'h-4'} />

            <AlertTitle>{t('setupFailed')}</AlertTitle>

            <AlertDescription>{t('setupFailedDescription')}</AlertDescription>
        </Alert>
    );
}
