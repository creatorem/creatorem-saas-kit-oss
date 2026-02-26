'use client';

import { SignOutButton } from '@kit/auth/www/ui/sign-out-button';
import { User } from '@kit/drizzle';
import { useSignOut } from '@kit/supabase';
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
import { toast } from '@kit/ui/sonner';
import { ThemeSwitcher } from '@kit/ui/theme-switcher';
import { getInitials } from '@kit/utils';
import { dashboardRoutes } from '@kit/utils/config';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppUrl } from '~/hooks/use-app-url';
import { showContentTypeCmdSearch } from '~/lib/show-content-type-cmd-search';

function isDialogOpen(): boolean {
    return !!document.querySelector('[role="dialog"]');
}

function isInputFocused(): boolean {
    const focusedElement = document.activeElement;
    return !!focusedElement && (focusedElement.tagName === 'INPUT' || focusedElement.tagName === 'TEXTAREA');
}

function getPlatform(): string {
    if (typeof window === 'undefined') {
        return 'unknown'; // Handle server-side rendering
    }

    const nav = navigator as Navigator & {
        userAgentData?: {
            platform: string;
        };
    };

    // Check for userAgentData (modern browsers)
    if (nav.userAgentData?.platform) {
        return nav.userAgentData.platform;
    }

    // Fallback to navigator.platform (older browsers)
    if (navigator.platform) {
        // Check for Android specifically
        if (navigator.userAgent && /android/i.test(navigator.userAgent)) {
            return 'android';
        }
        return navigator.platform;
    }

    return 'unknown';
}

function isMac(): boolean {
    return /mac/.test(getPlatform());
}

export type NavUserProps = React.ComponentProps<typeof SidebarGroup> & {
    user: User;
};

export function NavUser({ user, ...other }: NavUserProps): React.JSX.Element {
    const router = useRouter();
    const { url } = useAppUrl();
    const { t } = useTranslation('dashboard');

    const handleNavigateToProfilePage = (): void => {
        router.push(url(dashboardRoutes.paths.dashboard.slug.settings.profile));
    };
        const handleShowCommandMenu = (): void => {
        showContentTypeCmdSearch();
    };

    const signOut = useSignOut();
    const handleSignOut = useCallback(async (): Promise<void> => {
        const result = await signOut.mutateAsync();

        if (result?.error) {
            toast.error(t('userMenu.signOutError'));
        }

        router.push(dashboardRoutes.paths.auth.signIn);
    }, [signOut, router, t]);

    React.useEffect(() => {
        const mac = isMac();
        const hotkeys: Record<string, { action: () => void; shift: boolean }> = {
            p: { action: handleNavigateToProfilePage, shift: true },
                        s: { action: handleSignOut, shift: true },
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (isDialogOpen() || isInputFocused()) return;

            const modifierKey = mac ? e.metaKey : e.ctrlKey;
            if (!modifierKey) return;

            const hotkey = hotkeys[e.key];
            if (!hotkey) return;
            if (hotkey.shift && !e.shiftKey) return;

            e.preventDefault();
            hotkey.action();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
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
                                <DropdownMenuItem className="cursor-pointer" onClick={handleNavigateToProfilePage}>
                                    {t('userMenu.profile')}
                                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onClick={handleShowCommandMenu}>
                                    {t('userMenu.commandMenu')}
                                    <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
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
                            >
                                <DropdownMenuItem className="cursor-pointer">
                                    {t('userMenu.signOut')}
                                    <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </SignOutButton>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}
