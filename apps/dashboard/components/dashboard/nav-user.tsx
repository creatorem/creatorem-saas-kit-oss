'use client';

import { SignOutButton } from '@kit/auth/www/ui/sign-out-button';
import { User } from '@kit/drizzle';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Icon } from '@kit/ui/icon';
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@kit/ui/sidebar';
import { ThemeSwitcher } from '@kit/ui/theme-switcher';
import { getInitials } from '@kit/utils';
import { dashboardRoutes } from '@kit/shared/config/routes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FilterApplier } from '@kit/utils/filters';
import { useAppUrl } from '~/hooks/use-app-url';
import Link from 'next/link';

export type NavUserProps = React.ComponentProps<typeof SidebarGroup> & {
    user: User;
};

export function NavUser({ user, ...other }: NavUserProps): React.JSX.Element {
    const { t } = useTranslation('dashboard');
    const { url } = useAppUrl();

    return (
        <SidebarGroup {...other}>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton className="group/navuser data-[state=open]:bg-accent data-[state=open]:text-accent-foreground -ml-1.5 transition-none group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:!p-1">
                                <Avatar className="size-7 rounded-full">
                                    <AvatarImage src={user.profileUrl ?? undefined} alt={user.name} />
                                    <AvatarFallback className="rounded-full text-xs group-hover/navuser:bg-neutral-200 dark:group-hover/navuser:bg-neutral-700">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex w-full flex-col truncate text-left group-data-[minimized=true]:hidden">
                                    <span className="truncate text-sm font-semibold">{user.name}</span>
                                </div>
                                <Icon
                                    name="MoreHorizontal"
                                    className="text-muted-foreground h-8 group-data-[minimized=true]:hidden"
                                />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="truncate text-sm leading-none font-medium">{user.name}</p>
                                    <p className="text-muted-foreground text-xs leading-none">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href={url(dashboardRoutes.paths.dashboard.slug.settings.profile)}>
                                        {t('userMenu.profile')}
                                        <DropdownMenuShortcut>
                                            <FilterApplier name="display_keybinding" options={{ actionSlug: 'navigation.settings' }} />
                                        </DropdownMenuShortcut>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href={url(dashboardRoutes.paths.dashboard.slug.settings.organization.billing)}>
                                        {t('userMenu.billing')}
                                        <DropdownMenuShortcut>
                                            <FilterApplier name="display_keybinding" options={{ actionSlug: 'navigation.settings.organization.billing' }} />
                                        </DropdownMenuShortcut>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">
                                    {t('userMenu.commandMenu')}
                                    <DropdownMenuShortcut>
                                        <FilterApplier name="display_keybinding" options={{ actionSlug: 'search.command' }} />
                                    </DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex cursor-default flex-row justify-between !bg-transparent"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <p>{t('userMenu.theme')}</p>
                                    <ThemeSwitcher />
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <SignOutButton
                                asChild
                                aria-label={t('userMenu.signOut')}
                                redirectTo={dashboardRoutes.paths.auth.signIn}
                                variant="ghost_destructive"
                            >
                                <DropdownMenuItem className="cursor-pointer">
                                    {t('userMenu.signOut')}
                                </DropdownMenuItem>
                            </SignOutButton>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}
