import { envs } from '@kit/monitoring/envs';

function isPlaceholderDsn(dsn: string): boolean {
    return /x{4,}/i.test(dsn) || dsn.includes('/000000');
}

export function getValidSentryDsn(): string | undefined {
    const dsn = envs().NEXT_PUBLIC_SENTRY_DSN?.trim();
    if (!dsn || isPlaceholderDsn(dsn)) {
        return undefined;
    }

    try {
        const parsed = new URL(dsn);
        const projectId = parsed.pathname.replace(/^\//, '');

        if (!parsed.username || !projectId || !/^\d+$/.test(projectId)) {
            return undefined;
        }

        return dsn;
    } catch {
        return undefined;
    }
}
