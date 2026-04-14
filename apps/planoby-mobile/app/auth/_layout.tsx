import { AuthLayoutScreens } from '@kit/auth/native/screens/auth-layout-screens';
import { Stack } from 'expo-router';
import { authConfig } from '~/config/auth.config';
import { useScreenStatus } from '~/hooks/use-screen-status';

export default function AuthLayout() {
    const { screenOptions } = useScreenStatus();

    return (
        <AuthLayoutScreens authConfig={authConfig}>
            <Stack screenOptions={screenOptions} />
        </AuthLayoutScreens>
    );
}
