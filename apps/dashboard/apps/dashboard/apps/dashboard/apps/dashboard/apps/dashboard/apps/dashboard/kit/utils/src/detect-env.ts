/**
 * Enum defining the possible runtime environments
 * The environment of the event.
 * nodejs: Node.js (server-side)
 * edge: Nextjs proxy (server-side)
 * browser: Browser (client-side)
 * mobile: React Native (client-side)
 */
export type Environment = 'nodejs' | 'edge' | 'browser' | 'react-native';

/**
 * Detects the current runtime environment
 * @returns {Environment} The detected environment ('nodejs', 'edge', 'browser', or 'react-native')
 */
export function getEnvironment(): Environment {
    if (process.env.NEXT_RUNTIME === 'edge') {
        return 'edge';
    }

    // Check if running in React Native (including Expo)
    if (
        typeof global !== 'undefined' &&
        typeof global.navigator !== 'undefined' &&
        global.navigator.product === 'ReactNative'
    ) {
        return 'react-native';
    }

    if (typeof window !== 'undefined') {
        return 'browser';
    }

    return 'nodejs';
}
