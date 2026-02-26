'use client';

import { ScrollArea } from '@kit/ui/scroll-area';
import { Separator } from '@kit/ui/separator';
import { Sidebar, SidebarProvider, SidebarTrigger } from '@kit/ui/sidebar';
import { TooltipSc } from '@kit/ui/tooltip';
import { cn } from '@kit/utils';
import { useApplyFilter } from '@kit/utils/filters';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

type DashboardElement = HTMLDivElement;

type DashboardProps = React.HTMLAttributes<HTMLDivElement>;

const Dashboard = React.forwardRef<DashboardElement, DashboardProps>(({ children, className, ...other }, ref) => (
    <div ref={ref} className={cn('flex h-full flex-1 flex-col [--primary-bar-height:56px]', className)} {...other}>
        {children}
    </div>
));
Dashboard.displayName = 'Dashboard';

type DashboardHeaderElement = HTMLDivElement;
type DashboardHeaderProps = React.HTMLAttributes<HTMLDivElement>;
const DashboardHeader = React.forwardRef<DashboardHeaderElement, DashboardHeaderProps>(
    ({ className, children, ...other }, ref) => (
        <div ref={ref} className={cn('bg-background sticky top-0 z-20', className)} {...other}>
            {children}
        </div>
    ),
);
DashboardHeader.displayName = 'DashboardHeader';

type DashboardPrimaryBarElement = HTMLDivElement;
type DashboardPrimaryBarProps = React.HTMLAttributes<HTMLDivElement>;
const DashboardPrimaryBar = React.forwardRef<DashboardPrimaryBarElement, DashboardPrimaryBarProps>(
    ({ className, children, ...other }, ref) => {
        const { t } = useTranslation('dashboard');
        const sht = useApplyFilter('get_shortcut', null, { actionSlug: 'ui.toggleSidebar' });

        return (
            <div
                ref={ref}
                className={cn(
                    'relative flex h-[var(--primary-bar-height)] flex-row items-center gap-1 border-b px-4 sm:px-6',
                    className,
                )}
                {...other}
            >
                <TooltipSc content={sht ? `Toggle sidebar (${sht.shortcut})` : 'Toggle sidebar'}>
                    <SidebarTrigger className={className} aria-label={t('page.toggleSidebar')} />
                </TooltipSc>
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex w-full flex-row items-center justify-between">{children}</div>
            </div>
        );
    },
);
DashboardPrimaryBar.displayName = 'DashboardPrimaryBar';

type DashboardTitleElement = HTMLHeadingElement;
type DashboardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

const DashboardTitle = React.forwardRef<DashboardTitleElement, DashboardTitleProps>(
    ({ className, children, ...other }, ref) => (
        <h1 ref={ref} className={cn('text-sm font-semibold', className)} {...other}>
            {children}
        </h1>
    ),
);
DashboardTitle.displayName = 'DashboardTitle';

type DashboardActionsElement = HTMLDivElement;
type DashboardActionsProps = React.HTMLAttributes<HTMLDivElement>;
const DashboardActions = React.forwardRef<DashboardActionsElement, DashboardActionsProps>(
    ({ className, children, ...other }, ref) => (
        <div ref={ref} className={cn('flex items-center gap-2', className)} {...other}>
            {children}
        </div>
    ),
);
DashboardActions.displayName = 'DashboardActions';

type DashboardSecondaryBarElement = HTMLDivElement;
type DashboardSecondaryBarProps = React.HTMLAttributes<HTMLDivElement>;
const DashboardSecondaryBar = React.forwardRef<DashboardSecondaryBarElement, DashboardSecondaryBarProps>(
    ({ className, children, ...other }, ref) => (
        <div
            ref={ref}
            className={cn('relative flex h-12 items-center justify-between gap-2 border-b px-4 sm:px-6', className)}
            {...other}
        >
            {children}
        </div>
    ),
);
DashboardSecondaryBar.displayName = 'DashboardSecondaryBar';

type DashboardBodyElement = HTMLDivElement;
type DashboardBodyProps = React.HTMLAttributes<HTMLDivElement> & {
    disableScroll?: boolean;
};
const DashboardBody = React.forwardRef<DashboardBodyElement, DashboardBodyProps>(
    ({ children, className, disableScroll = false, ...other }, ref) => {
        if (disableScroll) {
            return (
                <div className={cn('h-[calc(100vh-var(--primary-bar-height))]', className)} ref={ref} {...other}>
                    {children}
                </div>
            );
        }

        return (
            <div
                className={cn('h-[calc(100vh-var(--primary-bar-height))] overflow-hidden', className)}
                ref={ref}
                {...other}
            >
                <ScrollArea className="h-full">{children}</ScrollArea>
            </div>
        );
    },
);
DashboardBody.displayName = 'DashboardBody';

const DashboardSidebarProvider = SidebarProvider;

const DashboardSidebar = Sidebar;

const DashboardCornerHeader = ({ children, className, ...other }: React.ComponentPropsWithoutRef<'div'>) => {
    return (
        <div
            data-slot="corner-header"
            className={cn(
                'flex h-[var(--primary-bar-height)] flex-row items-center gap-2 border-b p-3 py-0 [--primary-bar-height:56px] group-data-[collapsible=icon]:p-2',
                className,
            )}
            {...other}
        >
            {children}
        </div>
    );
};

export {
    Dashboard,
    DashboardActions,
    DashboardBody,
    DashboardCornerHeader,
    DashboardHeader,
    DashboardPrimaryBar,
    DashboardSecondaryBar,
    DashboardSidebar,
    DashboardSidebarProvider,
    DashboardTitle,
};
