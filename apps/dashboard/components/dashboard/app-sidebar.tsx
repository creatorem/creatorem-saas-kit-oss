'use client';

import { useUser } from '@kit/auth/www/user';
import { ScrollArea } from '@kit/ui/scroll-area';
import { SidebarContent, SidebarMenu, SidebarMenuItem, SidebarRail } from '@kit/ui/sidebar';
import { FilterApplier } from '@kit/utils/filters';
import React from 'react';
import { useBottomNavItems, useMainNavItems } from '~/lib/nav-items';
import { BrandLogo, Logo } from '../logo';
import { DashboardCornerHeader, DashboardSidebar } from './dashboard';
import { Nav } from './nav';
import { NavUser } from './nav-user';

export function AppSidebar(): React.JSX.Element {
    const user = useUser();
    const mainNavItems = useMainNavItems();
    const bottomNavItems = useBottomNavItems();

    return (
        <DashboardSidebar collapsible="icon">
            <SidebarContent className="flex h-full flex-col max-lg:gap-0">
                <DashboardCornerHeader className="mt-2">
                    <FilterApplier name="display_sidebar_logo_name">
                        <SidebarMenu>
                            <SidebarMenuItem className="block group-data-[collapsible=icon]:hidden">
                                <BrandLogo />
                            </SidebarMenuItem>
                            <SidebarMenuItem className="hidden group-data-[collapsible=icon]:block">
                                <Logo className="mx-auto size-6" />
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </FilterApplier>
                </DashboardCornerHeader>
                <ScrollArea className="min-h-0 flex-1 *:data-radix-scroll-area-viewport:h-full max-lg:mt-2 [&>[data-radix-scroll-area-viewport]>div]:h-full">
                    <Nav navItems={mainNavItems} className="max-lg:py-0" />
                </ScrollArea>
                <div className="flex flex-col gap-2 p-0 max-lg:mt-1">
                    <Nav navItems={bottomNavItems} className="max-lg:py-0" />
                    <div className="flex flex-col gap-2 p-3 pt-0 transition-all duration-300 group-data-[collapsible=icon]:px-1.5">
                        <NavUser user={user} className="p-0" />
                    </div>
                </div>
            </SidebarContent>
            <SidebarRail className="pointer-events-none hidden lg:pointer-events-auto lg:block" />
        </DashboardSidebar>
    );
}
