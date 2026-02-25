'use client';

import { OrganizationSwitcher } from '@kit/organization/www/ui';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@kit/ui/sidebar';
import React, { useCallback } from 'react';
import { OrgConfig } from '../../config';

export function SidebarOrganizationSwitcher({ orgConfig }: { orgConfig: OrgConfig }): React.JSX.Element {
    const { setOpenMobile } = useSidebar();

    const handleClose = useCallback((): void => {
        setOpenMobile(false);
        if (typeof window !== 'undefined') {
            document.body.style.removeProperty('pointer-events');
        }
    }, [setOpenMobile]);

    const wrapTrigger = useCallback((trigger: React.ReactNode) => {
        return (
            <SidebarMenuButton className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground h-10 w-full border px-1.5 group-data-[collapsible=icon]:rounded-[8px] group-data-[collapsible=icon]:!p-[3px]">
                {trigger}
            </SidebarMenuButton>
        );
    }, []);

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <OrganizationSwitcher orgConfig={orgConfig} onClose={handleClose} triggerWrapper={wrapTrigger} />
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
