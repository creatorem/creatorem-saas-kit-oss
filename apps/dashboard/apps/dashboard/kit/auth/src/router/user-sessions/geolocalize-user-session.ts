import { AppClient } from '@kit/db';
import { logger } from '@kit/utils';
import { z } from 'zod';

export const geolocalizeUserSessionSchema = z.object({
    ip: z.string().ip(),
});

function isPrivateOrLocalIP(ip: string): boolean {
    return (
        ip === '127.0.0.1' ||
        ip === '::1' ||
        ip === '0.0.0.0' ||
        ip === '::' ||
        ip.startsWith('192.168.') ||
        ip.startsWith('10.') ||
        ip.startsWith('172.16.') ||
        ip.startsWith('172.17.') ||
        ip.startsWith('172.18.') ||
        ip.startsWith('172.19.') ||
        ip.startsWith('172.20.') ||
        ip.startsWith('172.21.') ||
        ip.startsWith('172.22.') ||
        ip.startsWith('172.23.') ||
        ip.startsWith('172.24.') ||
        ip.startsWith('172.25.') ||
        ip.startsWith('172.26.') ||
        ip.startsWith('172.27.') ||
        ip.startsWith('172.28.') ||
        ip.startsWith('172.29.') ||
        ip.startsWith('172.30.') ||
        ip.startsWith('172.31.') ||
        ip.startsWith('fe80:') ||
        ip.startsWith('fc00:') ||
        ip.startsWith('fd00:')
    );
}

async function getIPLocation(ip: string): Promise<{
    city?: string;
    region?: string;
    country?: string;
    country_code?: string;
    timezone?: string;
    isp?: string;
} | null> {
    try {
        const response = await fetch(
            `http://ip-api.com/json/${ip}?fields=city,regionName,country,countryCode,timezone,isp,status,message`,
            { headers: { 'User-Agent': 'Session-Manager/1.0' }, signal: AbortSignal.timeout(5000) },
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.status === 'fail') {
            logger.warn({ ip, message: data.message }, 'IP location lookup failed');
            return null;
        }
        return {
            city: data.city || undefined,
            region: data.regionName || undefined,
            country: data.country || undefined,
            country_code: data.countryCode || undefined,
            timezone: data.timezone || undefined,
            isp: data.isp || undefined,
        };
    } catch (error) {
        logger.error({ error, ip }, 'Failed to fetch IP location');
        return null;
    }
}

function formatLocation(data: Awaited<ReturnType<typeof getIPLocation>>): string {
    if (!data) return 'Unknown Location';
    const parts: string[] = [];
    if (data.city) parts.push(data.city);
    if (data.region && data.region !== data.city) parts.push(data.region);
    if (data.country) parts.push(data.country);
    if (parts.length === 0) return data.isp || 'Unknown Location';
    return parts.join(', ');
}

export async function geolocalizeUserSessionAction(
    input: z.infer<typeof geolocalizeUserSessionSchema>,
    { db }: { db: AppClient },
) {
    const { ip } = input;

    if (isPrivateOrLocalIP(ip)) {
        return { ip, location: 'Local Network', details: null };
    }

    const locationData = await getIPLocation(ip);

    return { ip, location: formatLocation(locationData), details: locationData };
}
