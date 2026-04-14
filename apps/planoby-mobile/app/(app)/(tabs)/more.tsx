import { Redirect } from 'expo-router';

export default function LegacyMoreRedirectScreen() {
    return <Redirect href="/(app)/(tabs)/profile" />;
}
