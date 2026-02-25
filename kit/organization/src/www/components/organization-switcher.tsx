'use client';

import { Organization } from '@kit/drizzle';
import { useOrganization } from '@kit/organization/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Icon } from '@kit/ui/icon';
import { Input } from '@kit/ui/input';
import { ScrollArea } from '@kit/ui/scroll-area';
import { dashboardRoutes, replaceOrgSlug } from '@kit/utils/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface OrganizationSwitcherTriggerProps extends React.ComponentPropsWithoutRef<'div'> {
    organization: {
        name: string;
        logoUrl?: string | null;
    };
}

const OrganizationSwitcherTrigger: React.FC<OrganizationSwitcherTriggerProps> = ({ organization }) => {
    return (
        <>
            <Avatar className="aspect-square size-6 rounded-md">
                <AvatarImage className="rounded-md" src={organization.logoUrl ?? undefined} />
                <AvatarFallback className="text-foreground flex size-6 items-center justify-center rounded-md border font-medium">
                    {organization.name.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-row items-center gap-1 overflow-hidden">
                <span className="truncate text-sm leading-tight font-semibold">{organization.name}</span>
                <Icon name="ChevronsUpDown" className="text-muted-foreground ml-auto size-4 shrink-0" />
            </div>
        </>
    );
};

interface OrganizationSwitcherProps {
    onClose?: () => void;
    className?: string;
    triggerWrapper?: (trigger: React.ReactNode) => React.ReactNode;
}

export function OrganizationSwitcher({
    onClose,
    className,
    triggerWrapper,
}: OrganizationSwitcherProps): React.JSX.Element {
    const { t } = useTranslation('p_org');
    const router = useRouter();
    const { organization, userMemberships } = useOrganization();
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredOrgMemberships = useMemo(() => {
        if (searchTerm.length > 1) {
            return userMemberships.filter(({ organization: o }) =>
                o.name.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        return userMemberships;
    }, [userMemberships, searchTerm]);

    const handleOpenChange = useCallback((open: boolean): void => {
        if (open) {
            setSearchTerm('');
        }
    }, []);

    const handleOrgChange = useCallback(
        async (orgOfMember: Organization) => {
            router.push(replaceOrgSlug(dashboardRoutes.paths.dashboard.slug.index, orgOfMember.slug));
            onClose?.();
        },
        [onClose, router],
    );

    const defaultTrigger = <OrganizationSwitcherTrigger organization={organization} className={className} />;

    const trigger = triggerWrapper ? triggerWrapper(defaultTrigger) : defaultTrigger;

    return (
        <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="center"
                side="bottom"
                sideOffset={4}
            >
                <div className="relative">
                    <Icon
                        name="Search"
                        className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2"
                    />
                    <Input
                        placeholder={t('organizationSwitcher.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border-none! pl-8 shadow-none outline-hidden!"
                    />
                </div>
                <DropdownMenuSeparator />
                {filteredOrgMemberships.length === 0 ? (
                    <div className="text-muted-foreground p-2 text-sm">
                        {t('organizationSwitcher.noOrganizationFound')}
                    </div>
                ) : (
                    <ScrollArea className="-mr-1 pr-1 [&>[data-radix-scroll-area-viewport]]:max-h-[200px]">
                        {filteredOrgMemberships.map(({ organization: orgOfMember, id }) => (
                            <DropdownMenuItem
                                key={id}
                                onClick={() => handleOrgChange(orgOfMember)}
                                className="cursor-pointer gap-2 p-2"
                            >
                                <Avatar className="aspect-square size-4 rounded-xs">
                                    <AvatarImage className="rounded-xs" src={orgOfMember.logoUrl ?? undefined} />
                                    <AvatarFallback className="text-foreground flex size-4 items-center justify-center rounded-xs border text-xs font-medium">
                                        {orgOfMember.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {orgOfMember.name}
                                {orgOfMember.id === organization.id && (
                                    <div className="text-primary-foreground bg-primary ml-auto flex size-4 items-center justify-center rounded-full">
                                        <Icon name="Check" className="size-3 shrink-0 text-white" />
                                    </div>
                                )}
                            </DropdownMenuItem>
                        ))}
                    </ScrollArea>
                )}

                {userMemberships.length > 1 && (
                    <DropdownMenuItem asChild className="cursor-pointer gap-2 p-2">
                        <Link
                            href={dashboardRoutes.paths.dashboard.index}
                            className="text-muted-foreground"
                            onClick={onClose}
                        >
                            <Icon name="MoreHorizontal" className="size-4 shrink-0" />
                            {t('organizationSwitcher.allOrganizations')}
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer gap-2 p-2">
                    <Link
                        href={replaceOrgSlug(dashboardRoutes.paths.dashboard.slug.settings.index, organization.slug)}
                        onClick={onClose}
                    >
                        <Icon name="User" className="text-muted-foreground size-4 shrink-0" />
                        {t('organizationSwitcher.accountSettings')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer gap-2 p-2">
                    <Link
                        href={replaceOrgSlug(
                            dashboardRoutes.paths.dashboard.slug.settings.organization.index,
                            organization.slug,
                        )}
                        onClick={onClose}
                    >
                        <Icon name="Settings" className="text-muted-foreground size-4 shrink-0" />
                        {t('organizationSwitcher.organizationSettings')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer gap-2 p-2">
                    <Link href={dashboardRoutes.paths.onboarding.organization} onClick={onClose}>
                        <Icon name="Plus" className="text-muted-foreground size-4 shrink-0" />
                        {t('organizationSwitcher.addOrganization')}
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
