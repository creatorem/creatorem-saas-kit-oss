'use client';

import { useUser } from '@kit/auth/www/user';
import { type UIConfig } from '@kit/settings/shared';
import { SettingsNavigation } from '@kit/settings/www/ui';
import { Icon } from '@kit/ui/icon';
import { ScrollArea } from '@kit/ui/scroll-area';
import { SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from '@kit/ui/sidebar';
import { dashboardRoutes } from '@kit/utils/config';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppUrl } from '~/hooks/use-app-url';
import { DashboardCornerHeader, DashboardSidebar } from './dashboard';
import { NavUser } from './nav-user';

export function SettingsSidebar({ uiConfig }: { uiConfig: UIConfig<any> }): React.JSX.Element {
    const { t } = useTranslation('dashboard');
    const user = useUser();
    const { url } = useAppUrl();

    return (
        <DashboardSidebar collapsible="icon">
            <DashboardCornerHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={t('navigation.back')}>
                            <Link href={url(dashboardRoutes.paths.dashboard.slug.index)} className="h-10">
                                <Icon name="ChevronLeft" className="text-muted-foreground size-4 shrink-0" />
                                <span className="text-sm font-semibold">{t('navigation.settings')}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </DashboardCornerHeader>
            <SidebarContent className="flex h-full flex-col">
                <ScrollArea className="min-h-0 flex-1 max-lg:mt-2 [&>[data-radix-scroll-area-viewport]]:h-full [&>[data-radix-scroll-area-viewport]>div]:h-full">
                    <SettingsNavigation
                        uiConfig={uiConfig}
                        basePath={url(dashboardRoutes.paths.dashboard.slug.settings.index)}
                    />
                </ScrollArea>
                <div className="flex flex-col gap-2 p-0 max-lg:mt-1">
                    <div className="flex flex-col gap-2 p-3 pt-0 transition-all duration-300 group-data-[collapsible=icon]:px-1.5">
                        <NavUser user={user} className="p-0" />
                    </div>
                </div>
            </SidebarContent>
            <SidebarRail />
        </DashboardSidebar>
    );
}
