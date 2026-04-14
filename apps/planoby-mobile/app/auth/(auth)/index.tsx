import { Redirect } from 'expo-router';

export default function SignInPage() {
    return <Redirect href={'/auth/sign-in'} />;
}
