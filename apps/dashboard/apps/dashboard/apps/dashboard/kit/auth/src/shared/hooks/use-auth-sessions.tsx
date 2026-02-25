import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import type { toast as rnToast } from '@kit/native-ui/sonner';
import { useSignOut, useSupabase } from '@kit/supabase';
import type { toast as wwwToast } from '@kit/ui/sonner';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UAParser } from 'ua-parser-js';
import type { authRouter } from '../../router/router';
import { UserSession } from '../../router/user-sessions/get-user-sessions';

export const parseUserAgent = (userAgent: string | null) => {
    if (!userAgent) {
        return {
            browser: 'Unknown',
            browserVersion: null,
            os: 'Unknown',
            osVersion: null,
            device: 'desktop',
            deviceModel: null,
            isNativeApp: false,
        };
    }

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Detect native apps by checking for common patterns
    const isNativeApp =
        userAgent.includes('Expo') ||
        userAgent.includes('ReactNative') ||
        userAgent.includes('okhttp') ||
        (result.browser.name === undefined && result.device.type !== undefined) ||
        (!result.browser.name && userAgent.includes('CFNetwork'));

    return {
        browser: result.browser.name || 'Unknown',
        browserVersion: result.browser.version || null,
        os: result.os.name || 'Unknown',
        osVersion: result.os.version || null,
        device: result.device.type || 'mobile',
        deviceModel: result.device.model || null,
        isNativeApp,
    };
};

export const getDeviceLabel = (userAgent: string | null): string => {
    const parsed = parseUserAgent(userAgent);

    // Build OS display with version
    let osDisplay = parsed.os;
    if (parsed.osVersion) {
        osDisplay = `${parsed.os} ${parsed.osVersion}`;
    }

    // Build device model display
    let devicePrefix = '';
    if (parsed.deviceModel) {
        devicePrefix = `${parsed.deviceModel} `;
    }

    // Determine the platform/source
    let fromSource = '';
    if (parsed.isNativeApp) {
        // Native app
        if (parsed.device === 'mobile' || parsed.device === 'tablet') {
            fromSource = 'mobile app';
        } else {
            fromSource = 'desktop app';
        }
    } else {
        // Web browser
        if (parsed.browser && parsed.browser !== 'Unknown') {
            fromSource = parsed.browser;
        } else {
            fromSource = 'an unknown browser';
        }
    }

    // Build final label
    return `${devicePrefix}${osDisplay} from ${fromSource}`;
};

// interface Session {
//     id: string;
//     user_id: string;
//     created_at: string;
//     updated_at: string;
//     factor_id: string | null;
//     aal: string;
//     not_after: string | null;
//     user_agent: string | null;
//     ip: string | null;
// }

interface LocationInfo {
    location: string;
    loading: boolean;
}

export const useAuthSessions = ({
    toast,
    onCurrentSessionRevoked,
    clientTrpc,
}: {
    toast: typeof rnToast | typeof wwwToast;
    onCurrentSessionRevoked?: () => void;
    clientTrpc: TrpcClientWithQuery<typeof authRouter>;
}) => {
    const { t } = useTranslation('p_auth');
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState<string | null>(null);
    const [revokingAll, setRevokingAll] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [locationCache, setLocationCache] = useState<Record<string, LocationInfo>>({});

    const supabase = useSupabase();
    const signOut = useSignOut();

    const getCurrentSessionId = useCallback(async (): Promise<string | null> => {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error getting current session:', error);
                return null;
            }

            if (!data.session?.access_token) {
                return null;
            }

            // Extract session_id from JWT payload
            try {
                const tokenParts = data.session.access_token.split('.');
                if (tokenParts.length !== 3 || !tokenParts[1]) {
                    console.error('Invalid JWT format');
                    return null;
                }

                const base64Url = tokenParts[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
                        .join(''),
                );

                const payload = JSON.parse(jsonPayload);
                return payload.session_id || null;
            } catch (jwtError) {
                console.error('Error parsing JWT:', jwtError);
                return null;
            }
        } catch (error) {
            console.error('Error getting current session:', error);
            return null;
        }
    }, [supabase]);

    const fetchLocationForIP = useCallback(
        async (ip: string): Promise<string> => {
            if (!ip || locationCache[ip]) {
                return locationCache[ip]?.location || t('unknownLocation');
            }

            // Set loading state
            setLocationCache((prev) => ({
                ...prev,
                [ip]: { location: t('loading'), loading: true },
            }));

            try {
                const data = await clientTrpc.geolocalizeUserSession.fetch({ ip });
                const locationText = data.location ?? t('unknownLocation');

                // Update cache
                setLocationCache((prev) => ({
                    ...prev,
                    [ip]: { location: locationText, loading: false },
                }));

                return locationText;
            } catch (error) {
                console.error('Error fetching location for IP:', ip, error);
                const fallbackLocation = `IP: ${ip}`;

                setLocationCache((prev) => ({
                    ...prev,
                    [ip]: { location: fallbackLocation, loading: false },
                }));

                return fallbackLocation;
            }
        },
        [locationCache, t],
    );

    const fetchSessions = useCallback(async () => {
        try {
            setLoading(true);

            // Get current session ID first
            const currentId = await getCurrentSessionId();
            setActiveSessionId(currentId);

            const data = await clientTrpc.getUserSessions.fetch({});
            const fetchedSessions = data.sessions ?? [];
            setSessions(fetchedSessions);

            // Fetch location data for all sessions with valid IPs
            fetchedSessions.forEach((session: UserSession) => {
                if (session.ip && !isPrivateIP(session.ip)) {
                    fetchLocationForIP(session.ip);
                }
            });
        } catch (error) {
            console.error('Error fetching sessions:', error);
            toast.error(t('failedToLoadSessions'));
        } finally {
            setLoading(false);
        }
    }, [getCurrentSessionId, fetchLocationForIP, t]);

    const isPrivateIP = (ip: string): boolean => {
        return (
            ip === '127.0.0.1' ||
            ip === '::1' ||
            ip.startsWith('192.168.') ||
            ip.startsWith('10.') ||
            ip.startsWith('172.')
        );
    };

    const formatLocationDisplay = (ip: string | null): { text: string; isLoading: boolean } => {
        if (!ip) {
            return { text: t('unknownLocation'), isLoading: false };
        }

        if (isPrivateIP(ip)) {
            return { text: t('localNetwork'), isLoading: false };
        }

        const locationInfo = locationCache[ip];
        if (!locationInfo) {
            return { text: `IP: ${ip}`, isLoading: false };
        }

        return {
            text: locationInfo.location,
            isLoading: locationInfo.loading,
        };
    };

    const revokeSession = useCallback(
        async (sessionId: string) => {
            try {
                setRevoking(sessionId);
                await clientTrpc.revokeUserSession.fetch({ sessionId });

                toast.success(t('sessionRevokedSuccess'));
                fetchSessions(); // Refresh the list
            } catch (error) {
                console.error('Error revoking session:', error);
                toast.error(t('sessionRevokeError'));
            } finally {
                setRevoking(null);
            }
        },
        [fetchSessions, t],
    );

    const revokeAllOtherSessions = useCallback(async () => {
        try {
            setRevokingAll(true);
            const data = await clientTrpc.revokeAllUserSessions.fetch({});
            toast.success(t('revokeAllSuccess', { count: data.revokedCount }));
            fetchSessions(); // Refresh the list
        } catch (error) {
            console.error('Error revoking sessions:', error);
            toast.error(t('revokeAllError'));
        } finally {
            setRevokingAll(false);
        }
    }, [fetchSessions, t]);

    const revokeCurrentSession = useCallback(
        async (sessionId: string) => {
            try {
                setRevoking(sessionId);

                // First revoke the session from database
                await clientTrpc.revokeUserSession.fetch({ sessionId });

                // Then sign out the user and redirect
                await signOut.mutateAsync();
                onCurrentSessionRevoked?.();
            } catch (error) {
                console.error('Error revoking current session:', error);
                toast.error(t('sessionRevokeError'));
                setRevoking(null);
            }
        },
        [signOut, onCurrentSessionRevoked, t],
    );

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    // Debug function to help understand session detection
    const debugSessionInfo = useCallback(async () => {
        try {
            const data = await clientTrpc.debugUserSession.fetch({});
            console.log('Session Debug Info:', data);
        } catch (error) {
            console.error('Debug info fetch failed:', error);
        }
    }, [clientTrpc]);

    // Add debug info when component loads
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            debugSessionInfo();
        }
    }, [debugSessionInfo]);

    return {
        sessions,
        loading,
        revoking,
        revokingAll,
        activeSessionId,
        revokeAllOtherSessions,
        formatLocationDisplay,
        revokeCurrentSession,
        revokeSession,
    };
};
