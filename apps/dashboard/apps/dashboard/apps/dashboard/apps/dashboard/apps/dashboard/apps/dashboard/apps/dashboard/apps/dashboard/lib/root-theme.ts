import { Theme } from '@kit/utils/types/theme';
import { cookies } from 'next/headers';
import { appConfig } from '~/config/app.config';

/**
 * @name getRootTheme
 * @description Get the root theme from the cookies or default theme.
 * @returns The root theme.
 */
export async function getRootTheme() {
    try {
        const cookiesStore = await cookies();
        const themeCookie = cookiesStore.get('theme')?.value as Theme;
        return themeCookie ?? appConfig.theme ?? 'light';
    } catch {
        // Fallback during static generation
        return appConfig.theme ?? 'light';
    }
}
