'use client';

import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import NiceModal, { NiceModalHocProps } from '@ebay/nice-modal-react';
import { tableSchemaMap } from '@kit/drizzle';
import { Button } from '@kit/ui/button';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@kit/ui/command';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/ui/empty';
import { useNiceModal } from '@kit/ui/hooks/use-nice-modal';
import { Icon, IconName } from '@kit/ui/icon';
import { Skeleton } from '@kit/ui/skeleton';
import { debounce } from '@kit/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { type ComponentType, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { contentTypeRouter } from '../../router/router';
import type { ContentType } from '../../shared/types';
import { useCommandSearchHistory } from '../hooks/use-command-search-history';

const MIN_SEARCH_LENGTH = 1;

type Item = {
    id: string;
    updatedAt?: string | null;
    createdAt?: string | null;
    [key: string]: unknown;
};

type ResultItems<Keys extends ContentType[]> = {
    [LocalKey in Keys[number]]: (typeof tableSchemaMap)[LocalKey]['$inferSelect'][];
};

export interface NavigationItem {
    title: string;
    href: string;
    icon: IconName;
}

interface CommandSearchProps<Keys extends ContentType[], SelectParams> extends NiceModalHocProps {
    clientTrpc: TrpcClientWithQuery<typeof contentTypeRouter>;
    contentTypes: Keys;
    searchColumns: {
        [LocalKey in Keys[number]]: (keyof (typeof tableSchemaMap)[LocalKey]['$inferInsert'])[];
    };
    placeholder?: string;
    emptyText?: string;
    minSearchLength?: number;
    itemAppearance?: Partial<
        Record<
            Keys[number],
            {
                Icon?: ComponentType<{ className?: string }>;
                customRenderItem?: (item: Item) => ReactNode;
            }
        >
    >;
    groupLabels?: Partial<Record<Keys[number], string>>;
    onSelect?: (params: { contentType: Keys[number]; item: Item } & SelectParams) => void;
    getLink?: (params: { contentType: Keys[number]; item: Item } & SelectParams) => void;
    useSelectParams?: () => SelectParams;
    useNavigation?: () => NavigationItem[];
    navigationHeading?: string;
}

const defaultRenderItem = (item: Item) => {
    const displayName =
        (item.name as string) || (item.email as string) || (item.title as string) || (item.id as string);
    const displaySubtext =
        item.email && item.name
            ? (item.email as string)
            : item.description
              ? (item.description as string).substring(0, 50) + ((item.description as string).length > 50 ? '...' : '')
              : null;

    return (
        <div className="flex flex-col">
            <span className="font-medium">{displayName}</span>
            {displaySubtext && <span className="text-muted-foreground text-xs">{displaySubtext}</span>}
        </div>
    );
};

// todo: refactor CommandItem logic
// use function pattern to use ts generic type
export const createCommandSearch = <Keys extends ContentType[], SelectParams>() =>
    NiceModal.create<CommandSearchProps<Keys, SelectParams>>(
        ({
            clientTrpc,
            contentTypes,
            searchColumns,
            minSearchLength = MIN_SEARCH_LENGTH,
            placeholder = 'Type a command or search...',
            emptyText = 'No results found.',
            itemAppearance,
            groupLabels,
            onSelect,
            getLink,
            useSelectParams,
            useNavigation,
            navigationHeading = 'Quick Actions',
        }: CommandSearchProps<Keys, SelectParams>) => {
            const modal = useNiceModal();
            const router = useRouter();
            const pathname = usePathname();
            const [query, setQuery] = useState('');
            const [isLoading, setIsLoading] = useState(false);
            const [results, setResults] = useState<ResultItems<Keys> | null>(null);
            const [meta, setMeta] = useState<{
                totalEntries: number;
                searchTimeMs: number;
                hasMore?: Record<string, boolean>;
                totalByType?: Record<string, number>;
            } | null>(null);
            const [offsets, setOffsets] = useState<Record<string, number>>({});
            const [loadingMore, setLoadingMore] = useState<Record<string, boolean>>({});
            const contentTypesRef = useRef(contentTypes);
            const searchColumnsRef = useRef(searchColumns);
            const navigation = useNavigation ? useNavigation() : [];
            const { history, addToHistory } = useCommandSearchHistory({ contentTypes });

            const selectParams = useSelectParams?.() ?? {};

            const performSearch = useCallback(async (searchQuery: string, currentOffsets?: Record<string, number>) => {
                if (!searchQuery.trim()) {
                    setResults(null);
                    return;
                }

                setIsLoading(true);
                try {
                    const res = await clientTrpc.searchContentType.fetch({
                        contentTypes: contentTypesRef.current,
                        query: searchQuery,
                        limit: 10,
                        searchColumns: searchColumnsRef.current,
                        offsets: currentOffsets,
                    });

                    if (res?.results) {
                        setResults(res.results);
                        setMeta(res.meta ?? null);
                    } else if (res?.serverError) {
                        // eslint-disable-next-line no-console
                        console.error('Search error:', res.serverError);
                        setResults(null);
                        setMeta(null);
                    }
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('Search failed:', error);
                    setResults(null);
                    setMeta(null);
                } finally {
                    setIsLoading(false);
                }
            }, []);

            const loadMore = useCallback(
                async (contentType: Keys[number]) => {
                    if (!query.trim() || !results) return;

                    setLoadingMore((prev) => ({ ...prev, [contentType]: true }));

                    try {
                        const currentOffset = results[contentType]?.length ?? 0;
                        const newOffsets = { [contentType]: currentOffset };

                        const res = await clientTrpc.searchContentType.fetch({
                            contentTypes: [contentType],
                            query: query,
                            limit: 10,
                            searchColumns: { [contentType]: searchColumnsRef.current[contentType] },
                            offsets: newOffsets,
                        });

                        if (res?.results) {
                            setResults((prev) => {
                                if (!prev) return res.results;
                                return {
                                    ...prev,
                                    [contentType]: [...(prev[contentType] ?? []), ...(res.results[contentType] ?? [])],
                                } as ResultItems<Keys>;
                            });

                            setMeta((prev) => {
                                if (!prev || !res.meta) return prev;
                                return {
                                    ...prev,
                                    hasMore: {
                                        ...(prev.hasMore ?? {}),
                                        ...(res.meta.hasMore ?? {}),
                                    },
                                    totalByType: {
                                        ...(prev.totalByType ?? {}),
                                        ...(res.meta.totalByType ?? {}),
                                    },
                                };
                            });

                            setOffsets((prev) => ({
                                ...prev,
                                [contentType]: currentOffset + (res.results[contentType]?.length ?? 0),
                            }));
                        }
                    } catch (error) {
                        // eslint-disable-next-line no-console
                        console.error('Load more failed:', error);
                    } finally {
                        setLoadingMore((prev) => ({ ...prev, [contentType]: false }));
                    }
                },
                [query, results],
            );

            const debouncedSearch = useMemo(
                () =>
                    debounce(
                        ((searchQuery: string) => performSearch(searchQuery)) as (...args: unknown[]) => unknown,
                        300,
                    ),
                [performSearch],
            );

            useEffect(() => {
                if (!modal.visible) {
                    setQuery('');
                    setResults(null);
                    setIsLoading(false);
                    setOffsets({});
                    setLoadingMore({});
                    return;
                }
                const trimmed = query.trim();
                if (trimmed.length < minSearchLength) {
                    setResults(null);
                    setMeta(null);
                    setOffsets({});
                    return;
                }
                setOffsets({});
                debouncedSearch(trimmed);
            }, [query, debouncedSearch, modal.visible, minSearchLength]);

            const renderGroupLabel = (type: Keys[number]) => {
                if (groupLabels?.[type]) return groupLabels[type]!;
                return type.charAt(0).toUpperCase() + type.slice(1);
            };

            const showNavigation = query.trim().length < minSearchLength && navigation && navigation.length > 0;

            return (
                <CommandDialog open={modal.visible} onOpenChange={modal.handleOpenChange} shouldFilter={false}>
                    <CommandInput
                        isLoading={isLoading}
                        value={query}
                        onValueChange={setQuery}
                        placeholder={placeholder}
                    />
                    <CommandList>
                        {showNavigation ? (
                            <>
                                <CommandGroup heading={navigationHeading}>
                                    {navigation.map((navItem, index) => {
                                        const isActive = pathname === navItem.href;
                                        return (
                                            <CommandItem
                                                key={`nav-${index}`}
                                                value={`nav-${index}`}
                                                onSelect={() => {
                                                    router.push(navItem.href);
                                                    modal.handleClose();
                                                }}
                                                className="py-1.5!"
                                                disabled={isActive}
                                            >
                                                {navItem.icon ? (
                                                    <Icon
                                                        name={navItem.icon}
                                                        className="text-muted-foreground mr-2 h-4 w-4 shrink-0"
                                                    />
                                                ) : (
                                                    <Icon
                                                        name="ArrowRight"
                                                        className="text-muted-foreground mr-2 h-4 w-4 shrink-0"
                                                    />
                                                )}
                                                <span>{navItem.title}</span>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                                {history.length > 0 && (
                                    <CommandGroup heading="Recent">
                                        {history.map((historyItem, index) => {
                                            const appearance = itemAppearance?.[historyItem.type as Keys[number]];
                                            const render = appearance?.customRenderItem || defaultRenderItem;
                                            const link = getLink?.({
                                                contentType: historyItem.type,
                                                item: historyItem.item,
                                                ...selectParams,
                                            } as { contentType: Keys[number]; item: Item } & SelectParams);

                                            const itemContent = (
                                                <CommandItem
                                                    value={`history-${historyItem.type}-${historyItem.item.id}`}
                                                    onSelect={() => {
                                                        addToHistory(historyItem.type, historyItem.item);
                                                        onSelect?.({
                                                            contentType: historyItem.type,
                                                            item: historyItem.item,
                                                            ...selectParams,
                                                        } as {
                                                            contentType: Keys[number];
                                                            item: Item;
                                                        } & SelectParams);
                                                        modal.handleClose();
                                                    }}
                                                    className="py-1.5!"
                                                >
                                                    {appearance?.Icon ? (
                                                        <appearance.Icon className="text-muted-foreground mr-2 h-4 w-4 shrink-0" />
                                                    ) : (
                                                        <Icon
                                                            name="Clock"
                                                            className="text-muted-foreground mr-2 h-4 w-4 shrink-0"
                                                        />
                                                    )}
                                                    <div className="flex-1">{render(historyItem.item)}</div>
                                                </CommandItem>
                                            );

                                            return (
                                                <React.Fragment key={`history-${index}`}>
                                                    {link ? <Link href={link}>{itemContent}</Link> : itemContent}
                                                </React.Fragment>
                                            );
                                        })}
                                    </CommandGroup>
                                )}
                            </>
                        ) : (
                            <CommandEmpty className={'py-0'}>
                                {isLoading ? (
                                    <div className="flex flex-col gap-2 p-2">
                                        <Skeleton className="h-6 w-64" />
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <Skeleton
                                                key={index}
                                                className="h-15 w-full"
                                                style={{ animationDelay: `${(index + 1) * 50}ms` }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        <Empty className="min-h-[200px] rounded-md border border-dashed">
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <Icon name="Shell" className="size-6" />
                                                </EmptyMedia>
                                                <EmptyTitle>{emptyText}</EmptyTitle>
                                                <EmptyDescription>
                                                    Type a search request to get started.
                                                </EmptyDescription>
                                            </EmptyHeader>
                                        </Empty>
                                    </div>
                                )}
                            </CommandEmpty>
                        )}
                        {contentTypes.map((ct) => {
                            const items = results?.[ct as Keys[number]] ?? [];
                            const appearance = itemAppearance?.[ct as Keys[number]];
                            const render = appearance?.customRenderItem || defaultRenderItem;
                            const hasMoreItems = meta?.hasMore?.[ct] ?? false;
                            const isLoadingMore = loadingMore[ct] ?? false;
                            if (items.length === 0) return null;

                            return (
                                <CommandGroup key={ct} heading={renderGroupLabel(ct)}>
                                    {items.map((item) => {
                                        const link = getLink?.({ contentType: ct, item, ...selectParams } as {
                                            contentType: Keys[number];
                                            item: Item;
                                        } & SelectParams);

                                        const itemContent = (
                                            <CommandItem
                                                value={`${ct}-${item.id}`}
                                                onSelect={() => {
                                                    addToHistory(ct, item);
                                                    onSelect?.({ contentType: ct, item, ...selectParams } as {
                                                        contentType: Keys[number];
                                                        item: Item;
                                                    } & SelectParams);
                                                    modal.handleClose();
                                                }}
                                                className="py-1.5!"
                                            >
                                                {appearance?.Icon ? (
                                                    <appearance.Icon className="text-muted-foreground mr-2 h-4 w-4 shrink-0" />
                                                ) : (
                                                    <Icon
                                                        name="Search"
                                                        className="text-muted-foreground mr-2 h-4 w-4 shrink-0"
                                                    />
                                                )}
                                                <div className="flex-1">{render(item)}</div>
                                            </CommandItem>
                                        );

                                        return (
                                            <React.Fragment key={`${ct}-${item.id}`}>
                                                {link ? <Link href={link}>{itemContent}</Link> : itemContent}
                                            </React.Fragment>
                                        );
                                    })}
                                    {hasMoreItems && (
                                        <div className="px-2 py-1">
                                            <Button
                                                aria-label="Load more"
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-xs"
                                                onClick={() => loadMore(ct)}
                                                disabled={isLoadingMore}
                                            >
                                                {isLoadingMore ? (
                                                    <>
                                                        <Icon name="Loader" className="mr-2 h-3 w-3 animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Icon name="ChevronDown" className="mr-2 h-3 w-3" />
                                                        Load more
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </CommandGroup>
                            );
                        })}
                    </CommandList>
                    {meta && (
                        <div className="text-muted-foreground border-t px-2 py-1 text-xs">
                            {meta.totalEntries} results in {meta.searchTimeMs}ms
                        </div>
                    )}
                </CommandDialog>
            );
        },
    );
