import { useUser } from '@kit/auth/shared/user';
import { useApplyFilter } from '@kit/utils/filters';
import { useCallback } from 'react';

export const useAppUrl = () => {
    const user = useUser();

    const urlUpdater = useApplyFilter('get_url_updater', (u) => u);

    const url = useCallback(
        (u: string) => {
            const finalUrl = urlUpdater(u);
            if (!finalUrl.includes('[slug]')) return finalUrl;
            return finalUrl.replace('[slug]', user.id);
        },
        [user, urlUpdater],
    );

    return { url };
};
