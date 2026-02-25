'use client';

import { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Organization, OrganizationMember } from '@kit/drizzle';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/ui/empty';
import { Icon } from '@kit/ui/icon';
import { SearchInput } from '@kit/ui/search-input';
import { Skeleton } from '@kit/ui/skeleton';
import { replaceSlugInUrl } from '@kit/utils';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { organizationRouter } from '../../router/router';
import { OrgConfig, wwwConfig } from '../../config';

export type OrganizationListProps = {
    memberships: (OrganizationMember & {
        roleName: string;
        roleHierarchyLevel: number;
        organization: Organization;
    })[];
    refetch: () => void;
    orgConfig: OrgConfig
};

function OrganizationListInternal({ memberships, refetch, orgConfig }: OrganizationListProps): React.JSX.Element {
    const { t } = useTranslation('p_org');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredOrganizations = memberships.filter(
        (o) =>
            !searchQuery ||
            o.organization.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 ||
            o.organization.slug.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1,
    );

    const handleSearchQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchQuery(e.target?.value || '');
    }, []);

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle>{t('organizationList.title')}</CardTitle>
                <CardDescription className="hidden sm:block">{t('organizationList.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                    <SearchInput
                        placeholder={t('organizationList.searchPlaceholder')}
                        value={searchQuery}
                        onChange={handleSearchQueryChange}
                    />
                    <Button asChild aria-label={t('organizationList.addOrganization')} className="h-10">
                        <Link href={wwwConfig(orgConfig).urls.onboarding.index + '/organization'}>
                            <Icon name="Plus" className="size-4 shrink-0" />
                            <span className="hidden sm:inline">{t('organizationList.addOrganization')}</span>
                            <span className="inline sm:hidden">{t('organizationList.addOrganizationShort')}</span>
                        </Link>
                    </Button>
                </div>
                {filteredOrganizations.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Icon name="Store" className="size-6" />
                            </EmptyMedia>
                            <EmptyTitle>{t('organizationList.noOrganizationFound')}</EmptyTitle>
                            <EmptyDescription>
                                {searchQuery
                                    ? t('organizationList.adjustSearch')
                                    : t('organizationList.addFirstOrganization')}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="flex flex-col items-stretch justify-start gap-3">
                        {filteredOrganizations.map(({ organization, ...me }) => (
                            <Link
                                key={organization.id}
                                href={replaceSlugInUrl(wwwConfig(orgConfig).urls.organizationRoot + '/[slug]', organization.slug)}
                                className="hover:bg-primary/5 active:bg-secondary/50 group hover:border-primary relative flex flex-col rounded-lg border transition-all"
                            >
                                <div className="flex h-full flex-row items-center justify-between p-4">
                                    <div className="group-hover:text-secondary-foreground flex flex-row items-center gap-2 transition-colors">
                                        <Avatar className="aspect-square size-10 rounded-md">
                                            <AvatarImage
                                                className="rounded-md"
                                                src={organization?.logoUrl ?? undefined}
                                            />
                                            <AvatarFallback className="flex size-10 items-center justify-center rounded-md border border-neutral-200 bg-neutral-100 text-lg font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900">
                                                {organization.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-medium">{organization.name}</div>
                                            <div className="text-muted-foreground text-xs">
                                                {wwwConfig(orgConfig).urls.organizationRoot}/{organization.slug}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w- flex flex-row items-center gap-2">
                                        {me.isOwner && (
                                            <Badge variant="default" className="text-xs">
                                                <Icon name="Store" className="mr-1 size-3" />
                                                {t('organizationList.owner')}
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="flex flex-row items-center gap-2">
                                            <Icon name="User" className="size-3 shrink-0" />
                                            <span className="text-muted-foreground group-hover:text-secondary-foreground text-xs transition-colors">
                                                {me.roleName}
                                            </span>
                                        </Badge>
                                        <Icon
                                            name="ChevronRight"
                                            className="text-muted-foreground group-hover:text-secondary-foreground size-4 transition-colors"
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function OrganizationList({
    clientTrpc,
    orgConfig
}: {
    clientTrpc: TrpcClientWithQuery<typeof organizationRouter>;
    orgConfig: OrgConfig
}): React.JSX.Element {
    const membershipsRes = clientTrpc.organizationUserMemberships.useQuery();

    if (membershipsRes.isPending || !membershipsRes.data) {
        return <Skeleton className="h-84 w-full rounded-xl" />;
    }

    return <OrganizationListInternal memberships={membershipsRes.data} refetch={membershipsRes.refetch} orgConfig={orgConfig} />;
}
