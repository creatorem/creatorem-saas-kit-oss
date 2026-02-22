'use client';

import { IconName } from '@kit/ui/icon';
import { TooltipContent } from '@kit/ui/tooltip';
import { dashboardRoutes } from '@kit/utils/config';
import { FilterApplier } from '@kit/utils/filters';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppUrl } from '~/hooks/use-app-url';

export type NavItem = {
    title: string;
    href: string;
    disabled?: boolean;
    external?: boolean;
    icon: IconName;
    tooltip?: React.ComponentProps<typeof TooltipContent>;
};

export const useMainNavItems = (): NavItem[] => {
    const { t } = useTranslation('dashboard');
    const { url } = useAppUrl();

    return [
        {
            title: t('navigation.dashboard'),
            href: url(dashboardRoutes.paths.dashboard.slug.index),
            icon: 'Home',
            tooltip: {
                children: (
                    <div className="flex items-center gap-2">
                        <span>{t('navigation.dashboard')}</span>
                        <div className="flex items-center gap-0.5">
                            <FilterApplier name="display_keybinding" options={{ actionSlug: 'navigation.home' }} />
                        </div>
                    </div>
                ),
            },
        },
    ];
};

export const useBottomNavItems = (): NavItem[] => {
    const { t } = useTranslation('dashboard');
    const { url } = useAppUrl();

    return [
        {
            title: t('navigation.aiChat'),
            href: url(dashboardRoutes.paths.dashboard.slug.aiChat),
            icon: 'MessagesSquare',
            tooltip: {
                children: (
                    <div className="flex items-center gap-2">
                        <span>{t('navigation.aiChat')}</span>
                        {/* <div className="flex items-center gap-0.5">
                            <FilterApplier name="display_keybinding" options={{ actionSlug: 'navigation.aiChat' }} />
                        </div> */}
                    </div>
                ),
            },
        },
        {
            title: t('navigation.settings'),
            href: url(dashboardRoutes.paths.dashboard.slug.settings.index),
            icon: 'Settings',
            tooltip: {
                children: (
                    <div className="flex items-center gap-2">
                        <span>{t('navigation.settings')}</span>
                        <div className="flex items-center gap-0.5">
                            <FilterApplier name="display_keybinding" options={{ actionSlug: 'navigation.settings' }} />
                        </div>
                    </div>
                ),
            },
        },
    ];
};
