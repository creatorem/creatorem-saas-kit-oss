import { useUser } from '@kit/auth/shared/user';
import { Header } from '@kit/native-ui/layout/header';
import { QuickForm } from '@kit/native-ui/quick-form';
import { useApplyFilter } from '@kit/utils/filters';
import { QuickFormSchemaMap, QuickFormStepConfig } from '@kit/utils/quick-form';
import { useQueryClient } from '@tanstack/react-query';
import { Unmatched, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { onboardingSchema, onboardingStepsConfig } from '~/config/onboarding.config';
import { clientTrpc } from '~/utils/trpc-client';

export default function OnboardingPathPage() {
    const { onboardingPath } = useLocalSearchParams<{
        onboardingPath: string;
    }>();

    const user = useUser();
    const router = useRouter();
    const queryClient = useQueryClient();

    const content = useApplyFilter('render_onboarding_path', null, {
        onboardingPath,
        queryClient,
        clientTrpc,
        defaultSchema: onboardingSchema,
        defaultSteps: onboardingStepsConfig as unknown as QuickFormStepConfig<QuickFormSchemaMap>[],
    });

    if (!content) {
        return <Unmatched />;
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
                <Header showBackButton />

                <View className="px-6">
                    <QuickForm
                        config={content.config}
                        inputs={content.inputs}
                        defaultValues={{
                            userImageUrl: user?.profileUrl ?? undefined,
                            userName: user?.name ?? 'Unknown',
                            userPhone: user?.phone ?? '',
                            userEmail: user?.email ?? '',
                        }}
                        onSubmit={async (data) => {
                            await content.onSubmit(data);
                            router.push('/');
                        }}
                    />
                </View>
            </ScrollView>
        </View>
    );
}
