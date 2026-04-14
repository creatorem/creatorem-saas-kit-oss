import { Redirect } from 'expo-router';

export default function HomeRedirectScreen() {
    return <Redirect href="/(app)/(tabs)/agenda" />;
}
