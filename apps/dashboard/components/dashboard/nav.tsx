'use client';

import { Icon } from '@kit/ui/icon';
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@kit/ui/sidebar';
import { cn } from '@kit/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { NavItem } from '~/lib/nav-items';

interface NavProps extends React.ComponentProps<typeof SidebarGroup> {
    navItems: NavItem[];
}

export function Nav({ navItems, ...props }: NavProps): React.JSX.Element {
    const pathname = usePathname();

    return (
        <SidebarGroup {...props}>
            <SidebarMenu className="max-lg:px-1">
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href;

                    return (
                        <SidebarMenuItem key={index}>
                            <SidebarMenuButton asChild isActive={isActive} tooltip={item.tooltip ?? item.title}>
                                <Link
                                    href={item.disabled ? '~/' : item.href}
                                    target={item.external ? '_blank' : undefined}
                                >
                                    {isActive && (
                                        <div className="bg-primary absolute top-1/2 -left-[8px] h-[24px] w-[4px] -translate-y-1/2 rounded-lg lg:-left-[6px]"></div>
                                    )}
                                    <Icon
                                        name={item.icon}
                                        className={cn(
                                            'size-4 shrink-0',
                                            isActive ? 'text-foreground' : 'text-muted-foreground',
                                        )}
                                    />
                                    <span className={isActive ? 'dark:text-foreground' : 'dark:text-muted-foreground'}>
                                        {item.title}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
