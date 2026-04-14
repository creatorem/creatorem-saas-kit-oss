import { useUser } from '@kit/auth/shared/user';
import { Header } from '@kit/native-ui/layout/header';
import { QuickForm } from '@kit/native-ui/quick-form';
import { applyAsyncFilter, useApplyFilter } from '@kit/utils/filters';
import { QuickFormConfig, QuickFormSchemaMap, QuickFormStepConfig, SettingsInputsBase } from '@kit/utils/quick-form';
import { useQueryClient } from '@tanstack/react-query';
import { Href, router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import z from 'zod';
import { onboardingSchema, onboardingStepsConfig } from '~/config/onboarding.config';
import { clientTrpc } from '~/utils/trpc-client';

const zodOnboardingSchema = z.object(onboardingSchema);

const OnboardingScreen = () => {
    const user = useUser();
    const queryClient = useQueryClient();

    const schema = useApplyFilter('get_onboarding_schema', onboardingSchema) as typeof onboardingSchema;
    const steps = useApplyFilter(
        'get_onboarding_steps_config',
        onboardingStepsConfig as unknown as QuickFormStepConfig<QuickFormSchemaMap, SettingsInputsBase>[],
        {
            clientTrpc,
        },
    ) as unknown as typeof onboardingStepsConfig;

    const onboardingConfig = useMemo(() => {
        const config: QuickFormConfig<typeof schema> = {
            id: 'onboarding',
            submitButton: { hidden: true },
            schema,
            settings: [
                {
                    type: 'stepper',
                    nextButton: {
                        className: 'mx-auto w-full h-10',
                    },
                    hidePrevious: true,
                    contentClassName: 'flex mt-8 gap-4 flex-col',
                    steps,
                },
            ],
        };

        return config;
    }, [schema, steps]);

    const extraInputs = useApplyFilter('get_onboarding_extra_inputs', {});

    const handleSubmit = useCallback(async (data: z.infer<typeof zodOnboardingSchema>) => {
        await clientTrpc.updateUser.fetch(data);

        await queryClient.refetchQueries({
            queryKey: [clientTrpc.getUser.key],
        });

        const redirectUrl = await applyAsyncFilter('on_onboarding_submit', '/', {
            data,
            clientTrpc,
            queryClient,
        });

        router.push(redirectUrl as Href);
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
                <Header />

                <View className="px-6">
                    <QuickForm
                        config={onboardingConfig}
                        defaultValues={{
                            userImageUrl: user?.profileUrl ?? undefined,
                            userName: user?.name ?? 'Unknown',
                            userPhone: user?.phone ?? '',
                            userEmail: user?.email ?? '',
                        }}
                        inputs={extraInputs}
                        onSubmit={handleSubmit}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default OnboardingScreen;
