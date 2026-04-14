import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { createContext, ReactNode, useContext, useRef, useState } from 'react';
import { Platform } from 'react-native';

function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            throw new Error('Permission not granted to get push token for push notification!');
        }
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            throw new Error('Project ID not found');
        }
        try {
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            console.log({ pushTokenString });
            return pushTokenString;
        } catch (e: unknown) {
            throw new Error(`${e}`);
        }
    } else {
        handleRegistrationError('Must use physical device for push notifications');
    }
}

interface NotificationContextType {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
    error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    // useEffect(() => {
    //     registerForPushNotificationsAsync()
    //         .then((token) => setExpoPushToken(token ?? ''))
    //         .catch((error: any) => setError(error));

    //     notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
    //         console.log('🔔 Notification Received: ', notification);
    //         setNotification(notification);
    //     });

    //     responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
    //         console.log(
    //             '🔔 Notification Response: ',
    //             JSON.stringify(response, null, 2),
    //             JSON.stringify(response.notification.request.content.data, null, 2)
    //         );
    //         // Handle the notification response here
    //     });

    //     return () => {
    //         notificationListener.current?.remove();
    //         responseListener.current?.remove();
    //     };
    // }, []);

    return (
        <NotificationContext.Provider value={{ expoPushToken, notification, error }}>
            {children}
        </NotificationContext.Provider>
    );
};
