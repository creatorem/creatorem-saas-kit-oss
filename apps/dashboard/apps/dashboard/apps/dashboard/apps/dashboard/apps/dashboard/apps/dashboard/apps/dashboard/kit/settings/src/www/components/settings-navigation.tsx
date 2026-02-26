'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@kit/ui/accordion';
import { Icon } from '@kit/ui/icon';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@kit/ui/sidebar';
import { SettingsInputsBase } from '@kit/utils/quick-form';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
    GroupConfig,
    isGroupConfig,
    isPageConfig,
    PageConfig,
    SettingSchemaMap,
    type UIConfig,
} from '../../shared/type';

interface SettingsNavigationProps {
    uiConfig: UIConfig<any>;
    basePath: string;
}

export function SettingsNavigation({ uiConfig, basePath }: SettingsNavigationProps): React.ReactNode {
    const pathname = usePathname();

    // Render a page item
    const renderPageItem = (config: PageConfig<SettingSchemaMap<string>, SettingsInputsBase>, currentPath: string) => {
        if (!isPageConfig(config)) return null;

        const pathWithoutIndex = currentPath === 'index' ? '' : currentPath;
        // Handle path construction
        let itemPath;
        if (config.slug === 'index') {
            // For index pages in groups, use the group path without appending '/index'
            itemPath = `${basePath}/${pathWithoutIndex}`;
        } else {
            // For regular pages, append the slug
            itemPath = `${basePath}/${pathWithoutIndex}${pathWithoutIndex ? '/' : ''}${config.slug}`;
        }

        const isActive = pathname === (itemPath.at(-1) === '/' ? itemPath.slice(0, -1) : itemPath);

        return (
            <SidebarMenuItem key={config.slug}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={config.title}>
                    <Link href={itemPath}>
                        <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                            {/* @ts-ignore */}
                            <Icon name={config.icon} className="h-4 w-4" />
                        </span>
                        <span className={isActive ? 'dark:text-foreground' : 'dark:text-muted-foreground'}>
                            {config.title}
                        </span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    };

    // Render a nested group using accordion
    const renderNestedGroup = (
        config: GroupConfig<SettingSchemaMap<string>, SettingsInputsBase>,
        currentPath: string,
    ) => {
        if (!isGroupConfig(config)) return null;

        // Skip rendering the index group
        if (config.group === 'index') return null;

        return (
            <AccordionItem key={config.group} value={config.group}>
                <AccordionTrigger className="py-1 text-sm">
                    <span className="text-muted-foreground">{config.label}</span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="ml-4 space-y-1">
                        {config.settingsPages.map((childConfig) => {
                            if (isPageConfig(childConfig)) {
                                return renderPageItem(childConfig, config.group);
                            } else if (isGroupConfig(childConfig)) {
                                return renderNestedGroup(childConfig, config.group);
                            }
                            return null;
                        })}
                    </div>
                </AccordionContent>
            </AccordionItem>
        );
    };

    // Render the main navigation
    return (
        <>
            {uiConfig.map((config) => {
                // Handle group configurations
                const groupConfig = config as unknown as GroupConfig<SettingSchemaMap<string>, SettingsInputsBase>;
                const pageConfig = config as unknown as PageConfig<SettingSchemaMap<string>, SettingsInputsBase>;
                if (isGroupConfig(groupConfig)) {
                    return (
                        <SidebarGroup key={groupConfig.group}>
                            <SidebarGroupLabel>{groupConfig.label}</SidebarGroupLabel>
                            <SidebarMenu>
                                {/* Direct child pages */}
                                {groupConfig.settingsPages
                                    .filter(isPageConfig)
                                    .map((page) => renderPageItem(page, groupConfig.group))}
                                {groupConfig.settingsPages.filter(isGroupConfig).length > 0 && (
                                    <Accordion type="multiple" defaultValue={[]} className="w-full">
                                        {groupConfig.settingsPages
                                            .filter(isGroupConfig)
                                            .map((nestedGroup) => renderNestedGroup(nestedGroup, groupConfig.group))}
                                    </Accordion>
                                )}
                            </SidebarMenu>
                        </SidebarGroup>
                    );
                }
                // Handle page configurations
                else if (isPageConfig(pageConfig)) {
                    return (
                        <SidebarGroup key={pageConfig.slug}>
                            <SidebarMenu>{renderPageItem(pageConfig, '')}</SidebarMenu>
                        </SidebarGroup>
                    );
                }

                return null;
            })}
        </>
    );
}
