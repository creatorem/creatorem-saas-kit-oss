import { ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext) => ({
    ...config,
    runtimeVersion: '1.0.0',
    name: 'Planoby',
    slug: 'planoby',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/pwa-logo/apple-icon-180.png',
    scheme: 'planoby',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    jsEngine: 'hermes',
    updates: {
        url: 'https://u.expo.dev/31ba4806-f6c8-44ad-b6ca-52e410442b55',
    },
    splash: {
        image: './assets/pwa-logo/apple-splash-1242-2688.jpg',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
    },
    ios: {
        jsEngine: 'jsc',
        supportsTablet: true,
        bundleIdentifier: 'com.planoby.app',
    },
    android: {
        softwareKeyboardLayoutMode: 'pan',
        adaptiveIcon: {
            foregroundImage: './assets/pwa-logo/apple-icon-180.png',
            backgroundColor: '#ffffff',
        },
        package: 'com.planoby.app',
        permissions: ['android.permission.ACCESS_COARSE_LOCATION', 'android.permission.ACCESS_FINE_LOCATION'],
    },
    web: {
        bundler: 'metro',
        output: 'static',
        favicon: './assets/pwa-logo/apple-icon-180.png',
    },
    plugins: [
        'expo-router',
        'expo-font',
        'expo-web-browser',
        'expo-notifications',
        'expo-localization',
        '@react-native-community/datetimepicker',
        [
            'expo-secure-store',
            {
                configureAndroidBackup: true,
                faceIDPermission: 'Allow $(PRODUCT_NAME) to access your Face ID biometric data.',
            },
        ],
        [
            'expo-splash-screen',
            {
                image: './assets/pwa-logo/apple-splash-1242-2688.jpg',
                imageWidth: 200,
                resizeMode: 'contain',
                backgroundColor: '#ffffff',
            },
        ],
        [
            '@react-native-google-signin/google-signin',
            {
                iosUrlScheme:
                    process.env.EXPO_PUBLIC_IOS_URL_SCHEMA ??
                    'com.googleusercontent.apps.622271763287-030flq9of2mvpqc8gle64kl40v5h0ft3',
            },
        ],
        [
            'expo-image-picker',
            {
                photosPermission: 'The app accesses your photos to let you share them with your friends.',
            },
        ],
    ],
    experiments: {
        typedRoutes: true,
        reactCompiler: true,
    },
    extra: {
        router: {
            origin: false,
        },
        eas: {
            projectId: '31ba4806-f6c8-44ad-b6ca-52e410442b55',
        },
    },
});
