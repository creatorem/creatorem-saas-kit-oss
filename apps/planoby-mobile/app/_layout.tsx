import { Boldonse_400Regular, useFonts as useBoldonseFonts } from '@expo-google-fonts/boldonse';
import { Outfit_400Regular, Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, usePathname, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { RootProvider } from '~/components/providers/root-provider';
import { InitClientFilters } from '~/hooks/init-client-filters';
import { useScreenStatus } from '~/hooks/use-screen-status';

import '../global.css';

// Notifications.setNotificationHandler({
//     handleNotification: async () => ({
//         shouldPlaySound: true,
//         shouldSetBadge: true,
//         shouldShowBanner: true,
//         shouldShowList: true,
//     }),
// });

// const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

// TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error, executionInfo }) => {
//     console.log('✅ Received a notification in the background!', {
//         data,
//         error,
//         executionInfo,
//     });
//     // Do something with the notification data
// });

// Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

void SplashScreen.preventAutoHideAsync();

function RouterLogger() {
    const segments = useSegments();
    const pathname = usePathname();

    useEffect(() => {
        console.log('📍 Route changed:', {
            pathname,
            segments: segments.join('/'),
        });
    }, [pathname, segments]);

    return null;
}

function Navigation() {
    const { ThemedStatusBar, screenOptions } = useScreenStatus();

    useEffect(() => {
        return () => {
            void SplashScreen.hideAsync();
        };
    });

    return (
        <>
            <RouterLogger />
            <ThemedStatusBar />
            <Stack screenOptions={screenOptions} initialRouteName={undefined} />
            <PortalHost />
        </>
    );
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Outfit_400Regular,
        Outfit_700Bold,
    });
    const [boldonseFontsLoaded] = useBoldonseFonts({
        Boldonse_400Regular,
    });

    if (!fontsLoaded || !boldonseFontsLoaded) {
        return null;
    }

    return (
        <InitClientFilters>
            <RootProvider>
                <Navigation />
            </RootProvider>
        </InitClientFilters>
    );
}
