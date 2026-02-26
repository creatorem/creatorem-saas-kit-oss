'use client';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@kit/ui/breadcrumb';
import { Icon } from '@kit/ui/icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@kit/ui/tooltip';
import { dashboardRoutes } from '@kit/utils/config';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useAppUrl } from '~/hooks/use-app-url';

/**
 * Display a breadcrumb for the dashboard.
 * Dynamically displays URL segments relative to the dashboard path.
 *
 * @returns A breadcrumb navigation component
 */
export const DashboardBreadcrumb = ({
    info,
    segmentReplacements,
}: {
    info?: string;
    segmentReplacements?: Record<string, string>;
}) => {
    const pathname = usePathname();
    const { url } = useAppUrl();

    // Extract path segments, assuming dashboard paths start with /dashboard
    const segments = pathname.split('/').filter(Boolean);
    const isDashboardPath = segments[0] === 'dashboard';

    // If not a dashboard path, return null or a default breadcrumb
    if (!isDashboardPath) {
        return null;
    }

    return (
        <div className="flex flex-row items-center gap-2">
            <Breadcrumb>
                <BreadcrumbList className="gap-1 sm:gap-1">
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            href={url(dashboardRoutes.paths.dashboard.slug.index)}
                            className="flex aspect-square h-full items-center justify-center"
                        >
                            <Icon name="School" size={14} />
                        </BreadcrumbLink>
                    </BreadcrumbItem>

                    {/* Generate breadcrumb items for each path segment */}
                    {segments.slice(2).map((segment, index) => {
                        const href = `${url(dashboardRoutes.paths.dashboard.slug.index)}/${segments.slice(2, index + 3).join('/')}`;
                        const isLastItem = index === segments.length - 3;
                        const replacementText = segmentReplacements?.[segment] || segment;
                        const displayText =
                            replacementText.charAt(0).toUpperCase() + replacementText.slice(1).replace(/-/g, ' ');

                        return (
                            <React.Fragment key={segment}>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {isLastItem ? (
                                        <BreadcrumbPage className="text-foreground">{displayText}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink className="text-foreground" href={href}>
                                            {displayText}
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </React.Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
            {info && (
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Icon
                            name="BadgeInfo"
                            className="text-muted-foreground hidden size-4 shrink-0 cursor-pointer sm:inline"
                        />
                    </TooltipTrigger>
                    <TooltipContent>{info}</TooltipContent>
                </Tooltip>
            )}
        </div>
    );
};
