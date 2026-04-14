import { AuthProvider, AuthProviderSignedIn, AuthProviderSignedOut } from '@kit/auth/native/ui/auth-provider';
import { UserProvider } from '@kit/auth/shared/user';
import { Redirect, Slot } from 'expo-router';
import { LoadingScreen } from '~/components/loading-screen';
import { clientTrpc } from '~/utils/trpc-client';

export const unstable_settings = {
    initialRouteName: 'index',
};

export default function DrawerLayout() {
    return (
        <AuthProvider>
            <AuthProviderSignedIn>
                <OnboardingEndpoint />
            </AuthProviderSignedIn>

            <AuthProviderSignedOut>
                <Redirect href={'/auth/welcome'} />
            </AuthProviderSignedOut>
        </AuthProvider>
    );
}

function OnboardingEndpoint() {
    const user = clientTrpc.getUser.useQuery();

    if (user.isPending) {
        return <LoadingScreen />;
    }

    if (!user.data) {
        throw new Error(
            'Failed to get the db user even if the supabase user is defined. (1) Check that apps/dashboard is STARTED. (2) May be due to a client jwt auth issue or an api error.',
        );
    }

    return (
        <UserProvider user={user.data}>
            <Slot
                initialRouteName={undefined}
                screenOptions={
                    {
                        // animation: 'slide_from_right',
                        // animationDuration: 300,
                    }
                }
            />
        </UserProvider>
    );
}
