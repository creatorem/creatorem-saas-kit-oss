'use client';

import { dashboardRoutes } from '@kit/shared/config/routes';
import { usePathname } from 'next/navigation';
import React, { useMemo } from 'react';
import { useAppUrl } from '~/hooks/use-app-url';
import { useSettingsUiConfig } from '~/hooks/use-settings-ui-config';
import { AppSidebar } from './app-sidebar';
import { SettingsSidebar } from './settings-sidebar';

export function SidebarRenderer(): React.JSX.Element {
    const pathname = usePathname();
    const { url } = useAppUrl();

    const isSettingsRoute = useMemo(() => {
        const settingsRoute = url(dashboardRoutes.paths.dashboard.slug.settings.index);

        return pathname.startsWith(settingsRoute);
    }, [pathname, url]);

    const settingsConfig = useSettingsUiConfig();

    if (isSettingsRoute) {
        return <SettingsSidebar uiConfig={settingsConfig.ui} />;
    }

    return <AppSidebar />;
}
