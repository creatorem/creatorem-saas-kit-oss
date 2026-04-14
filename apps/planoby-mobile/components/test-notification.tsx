import { Button } from '@kit/native-ui/button';
import { Text } from '@kit/native-ui/text';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { useNotification } from './providers/notification-provider';

// async function sendPushNotification(expoPushToken: string) {
//   const message = {
//     to: expoPushToken,
//     sound: 'default',
//     title: 'Original Title',
//     body: 'And here is the body!',
//     data: { someData: 'goes here' },
//   };

//   await fetch('https://exp.host/--/api/v2/push/send', {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Accept-encoding': 'gzip, deflate',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(message),
//   });
// }

export function TestNotification() {
    const { notification, expoPushToken, error } = useNotification();
    const { currentlyRunning, isUpdateAvailable, isUpdatePending } = Updates.useUpdates();

    const [dummyState, setDummyState] = useState(0);

    if (error) {
        return <Text>Error: {error.message}</Text>;
    }

    useEffect(() => {
        if (isUpdatePending) {
            // Update has successfully downloaded; apply it now
            // Updates.reloadAsync();
            // setDummyState(dummyState + 1);
            // Alert.alert("Update downloaded and applied");

            dummyFunction();
        }
    }, [isUpdatePending]);

    const dummyFunction = async () => {
        try {
            await Updates.reloadAsync();
        } catch (e) {
            Alert.alert('Error');
        }

        // UNCOMMENT TO REPRODUCE EAS UPDATE ERROR
        // } finally {
        //   setDummyState(dummyState + 1);
        //   console.log("dummyFunction");
        // }
    };

    // If true, we show the button to download and run the update
    const showDownloadButton = isUpdateAvailable;

    // Show whether or not we are running embedded code or an update
    const runTypeMessage = currentlyRunning.isEmbeddedLaunch
        ? 'This app is running from built-in code'
        : 'This app is running an update';

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
            <Text className="text-foreground">Updates Demo 5</Text>
            <Text className="text-foreground">{runTypeMessage}</Text>
            <Button onPress={() => Updates.checkForUpdateAsync()}>
                <Text className="text-foreground">Check manually for updates</Text>
            </Button>
            {showDownloadButton ? (
                <Button onPress={() => Updates.fetchUpdateAsync()}>
                    <Text className="text-foreground">Download and run update</Text>
                </Button>
            ) : null}
            <Text style={{ color: 'red' }}>Your push token:</Text>
            <Text className="text-foreground">{expoPushToken}</Text>
            <Text className="text-foreground">Latest notification:</Text>
            <Text className="text-foreground">{notification?.request.content.title}</Text>
            <Text className="text-foreground">{JSON.stringify(notification?.request.content.data, null, 2)}</Text>
        </View>
    );
}
