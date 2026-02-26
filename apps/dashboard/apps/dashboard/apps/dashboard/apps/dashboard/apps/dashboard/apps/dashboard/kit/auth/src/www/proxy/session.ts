/**
 * Save session details in the database for the current authenticated user
 */

import type { Database } from '@kit/db';
import { logger } from '@kit/utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

interface SessionUpdateOptions {
    updateUserAgent?: boolean;
    updateIpAddress?: boolean;
}

/**
 * Updates session details in the database for the current authenticated user
 * This function is designed to be called from Next.js proxy
 */
async function getAuthenticatedSessionId(supabaseClient: SupabaseClient<Database>): Promise<string | null> {
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();

    if (sessionError || !sessionData.session) {
        return null;
    }

    const sessionId = await extractSessionIdFromJWT(sessionData.session.access_token);

    if (!sessionId) {
        logger.warn('Could not extract session ID from JWT token');
    }

    return sessionId;
}

async function updateSessionInDatabase(
    supabaseClient: SupabaseClient<Database>,
    sessionId: string,
    userAgent?: string | null,
    ipAddress?: string | null,
): Promise<boolean> {
    const { data, error } = await supabaseClient.schema('kit').rpc('update_session_details', {
        session_id: sessionId,
        new_user_agent: userAgent ?? undefined,
        new_ip: ipAddress,
    });

    if (error) {
        logger.error({ error, sessionId }, 'Failed to update session details');
        return false;
    }

    logger.debug(
        {
            sessionId,
            userAgent: userAgent?.substring(0, 50),
            ipAddress,
            updated: data,
        },
        'Session details updated',
    );

    return data === true;
}

export async function updateSessionDetails(
    supabaseClient: SupabaseClient<Database>,
    request: NextRequest,
    options: SessionUpdateOptions = {
        updateUserAgent: true,
        updateIpAddress: true,
    },
): Promise<boolean> {
    try {
        const sessionId = await getAuthenticatedSessionId(supabaseClient);

        if (!sessionId) {
            return false;
        }

        const userAgent = options.updateUserAgent ? request.headers.get('user-agent') : null;
        const ipAddress = options.updateIpAddress ? getClientIpAddress(request) : null;

        return await updateSessionInDatabase(supabaseClient, sessionId, userAgent, ipAddress);
    } catch (error) {
        logger.error({ error }, 'Error updating session details');
        return false;
    }
}

function isValidJWTStructure(tokenParts: string[]): boolean {
    return tokenParts.length === 3 && Boolean(tokenParts[1]);
}

function decodeBase64Url(base64Url: string): string {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
}

function decodeURIComponentSafely(encodedString: string): string {
    return decodeURIComponent(
        encodedString
            .split('')
            .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
            .join(''),
    );
}

/**
 * Extracts session ID from JWT access token
 */
async function extractSessionIdFromJWT(accessToken: string): Promise<string | null> {
    try {
        const tokenParts = accessToken.split('.');
        if (!isValidJWTStructure(tokenParts)) {
            return null;
        }

        const base64Url = tokenParts[1]!;
        const decodedBase64 = decodeBase64Url(base64Url);
        const jsonPayload = decodeURIComponentSafely(decodedBase64);

        const payload = JSON.parse(jsonPayload);
        return payload.session_id || null;
    } catch (error) {
        logger.error({ error }, 'Error parsing JWT token');
        return null;
    }
}

function extractFirstIpFromForwardedFor(forwardedFor: string): string | null {
    const ips = forwardedFor.split(',').map((ip) => ip.trim());
    return ips[0] || null;
}

function getIpFromHeaders(request: NextRequest): string | null {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const remoteAddr = request.headers.get('x-remote-addr');

    if (forwardedFor) {
        return extractFirstIpFromForwardedFor(forwardedFor);
    }

    if (realIp) {
        return realIp;
    }

    return remoteAddr;
}

function isLocalOrDevelopmentAddress(ip: string): boolean {
    const localhostAddresses = ['127.0.0.1', '::1', '0.0.0.0', '::'];
    const privateRanges = ['192.168.', '10.', '172.'];

    return localhostAddresses.includes(ip) || privateRanges.some((range) => ip.startsWith(range));
}

/**
 * Extracts client IP address from request, handling various proxy headers
 * Returns null for localhost/development addresses to preserve existing valid IPs
 */
function getClientIpAddress(request: NextRequest): string | null {
    const detectedIp = getIpFromHeaders(request);

    if (detectedIp && isLocalOrDevelopmentAddress(detectedIp)) {
        return null;
    }

    return detectedIp;
}

/**
 * Lightweight version that only updates the session's updated_at timestamp
 * Useful for tracking session activity without updating other details
 */
export async function updateSessionActivity(supabaseClient: SupabaseClient<Database>): Promise<boolean> {
    try {
        const sessionId = await getAuthenticatedSessionId(supabaseClient);

        if (!sessionId) {
            return false;
        }

        return await updateSessionInDatabase(supabaseClient, sessionId, undefined, null);
    } catch (error) {
        logger.error({ error }, 'Error updating session activity');
        return false;
    }
}

/**
 * Test function to verify session update functionality is working
 * This should only be used for debugging/testing purposes
 */
export async function testSessionUpdate(
    supabaseClient: SupabaseClient<Database>,
): Promise<{ sessionExists: boolean; sessionId: string | null; updateWorked: boolean }> {
    try {
        const sessionId = await getAuthenticatedSessionId(supabaseClient);

        if (!sessionId) {
            return { sessionExists: false, sessionId: null, updateWorked: false };
        }

        const updateResult = await updateSessionInDatabase(supabaseClient, sessionId, 'Test User Agent', '127.0.0.1');

        return {
            sessionExists: true,
            sessionId,
            updateWorked: updateResult,
        };
    } catch (error) {
        logger.error({ error }, 'Error testing session update');
        return { sessionExists: false, sessionId: null, updateWorked: false };
    }
}
