import { Redirect } from 'expo-router';
import { View } from 'react-native';

export default function AgendaTabRedirect() {
    return <Redirect href={'/(app)/screens/agenda'} />;
    // return (
    //     <View className="bg-red-300 flex-1">

    //     </View>
    // )
}
