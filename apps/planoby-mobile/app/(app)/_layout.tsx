import { AuthProvider, AuthProviderSignedIn, AuthProviderSignedOut } from '@kit/auth/native/ui/auth-provider';
import { UserProvider } from '@kit/auth/shared/user';
import { TrpcClientProvider } from '@planoby/shared/trpc-client-provider';
import { FilterApplier } from '@kit/utils/filters';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { LoadingScreen } from '~/components/loading-screen';
import { envs } from '~/envs';
import { clientTrpc } from '~/utils/trpc-client';

export const unstable_settings = {
    initialRouteName: 'index',
};

export default function DrawerLayout() {
    return (
        <AuthProvider>
            <AuthProviderSignedIn>
                <DrawerApp />
            </AuthProviderSignedIn>

            <AuthProviderSignedOut>
                <Redirect href={'/auth/welcome'} />
            </AuthProviderSignedOut>
        </AuthProvider>
    );
}

function DrawerApp() {
    const user = clientTrpc.getUser.useQuery();
    const { slug } = useLocalSearchParams<{ slug?: string }>();

    if (user.isPending) {
        return <LoadingScreen />;
    }

    if (!user.data) {
        throw new Error(
            'Failed to get the db user even if the supabase user is defined. (1) Check that apps/dashboard is STARTED. (2) May be due to a client jwt auth issue or an api error.',
        );
    }

    if (!user.data.completedOnboarding) {
        return <Redirect href={'/onboarding'} />;
    }

    return (
        <UserProvider user={user.data}>
            <FilterApplier
                name="display_trpc_provider_wrapper_in_mobile"
                options={{
                    slug,
                    clientTrpc,
                    loader: <LoadingScreen />,
                }}
            >
                <TrpcClientProvider url={`${envs().EXPO_PUBLIC_DASHBOARD_URL}/api/trpc`}>
                    <FilterApplier name="display_trpc_provider_child_in_dashboard" options={{}}>
                        <Stack
                            screenOptions={{
                                headerShown: false,
                                animation: 'slide_from_right',
                                animationDuration: 300,
                            }}
                        />
                    </FilterApplier>
                </TrpcClientProvider>
            </FilterApplier>
        </UserProvider>
    );
}
