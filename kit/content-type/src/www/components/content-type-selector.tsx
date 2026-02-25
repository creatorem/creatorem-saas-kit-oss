'use client';

import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Button } from '@kit/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@kit/ui/command';
import { Icon } from '@kit/ui/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { cn, debounce } from '@kit/utils';
import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { contentTypeRouter } from '../../router/router';
import type { ContentType } from '../../shared/types';

const QUERY_MIN_LENGTH = 1;

// Default item renderer
const defaultRenderItem = (item: Item) => {
    const displayName = item.name || item.email || item.title || item.id;
    const displaySubtext =
        item.email && item.name
            ? item.email
            : item.description
              ? (item.description as string).substring(0, 50) + ((item.description as string).length > 50 ? '...' : '')
              : null;

    return (
        <div className="flex flex-col">
            <span className="font-medium">{displayName as string}</span>
            {displaySubtext && <span className="text-muted-foreground text-xs">{displaySubtext as string}</span>}
        </div>
    );
};

type Item = {
    id: string;
    updatedAt: string;
    createdAt: string;
    [key: string]: unknown;
};

// Props for the main component
interface ContentTypeSelectorProps {
    clientTrpc: TrpcClientWithQuery<typeof contentTypeRouter>;
    contentType: ContentType;
    value?: string | null;
    onChange?: (id: string | null) => void;
    onBlur?: () => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    renderItem?: (item: any) => React.ReactNode;
    emptyText?: string;
    limit?: number;
    searchFields: string[];
    displayField?: string;
    noClear?: boolean;
}

export function ContentTypeSelector({
    clientTrpc,
    contentType,
    value,
    onChange,
    onBlur,
    limit = 10,
    disabled,
    placeholder = 'Search...',
    className,
    renderItem,
    emptyText = 'No results found.',
    searchFields,
    displayField,
    noClear = false,
}: ContentTypeSelectorProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [isPending, startTransition] = useTransition();
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Use ref to avoid infinite loop from searchFields array reference changing
    const searchFieldsRef = useRef(searchFields);
    useEffect(() => {
        searchFieldsRef.current = searchFields;
    }, [searchFields]);

    // Debounced search function
    const performSearch = useCallback(
        async (searchQuery: string, offset = 0) => {
            if (!searchQuery.trim()) {
                setResults([]);
                setHasMore(false);
                setTotalCount(0);
                return;
            }

            setIsLoading(true);
            try {
                const result = await clientTrpc.searchContentType.fetch({
                    contentTypes: [contentType],
                    query: searchQuery,
                    limit: limit,
                    searchColumns: { [contentType]: searchFieldsRef.current },
                    offsets: offset > 0 ? { [contentType]: offset } : undefined,
                });

                if (result) {
                    const dict = result.results as Record<string, Item[]>;
                    const list = dict[contentType] ?? [];
                    const meta = result.meta as
                        | {
                              hasMore?: Record<string, boolean>;
                              totalByType?: Record<string, number>;
                          }
                        | undefined;

                    setResults(list);
                    setHasMore(meta?.hasMore?.[contentType] ?? false);
                    setTotalCount(meta?.totalByType?.[contentType] ?? 0);
                }
            } catch (error) {
                console.error('Search failed:', error);
                setResults([]);
                setHasMore(false);
                setTotalCount(0);
            } finally {
                setIsLoading(false);
            }
        },
        [contentType, limit],
    );

    const loadMore = useCallback(async () => {
        if (!query.trim() || !hasMore || isLoadingMore) return;

        setIsLoadingMore(true);
        try {
            const currentOffset = results.length;
            const result = await clientTrpc.searchContentType.fetch({
                contentTypes: [contentType],
                query: query,
                limit: limit,
                searchColumns: { [contentType]: searchFieldsRef.current },
                offsets: { [contentType]: currentOffset },
            });

            // if (result && 'data' in result && result.data?.results) {
            if (result) {
                // const dict = result.data.results as Record<string, Item[]>;
                const dict = result.results as Record<string, Item[]>;
                const list = dict[contentType] ?? [];
                const meta = result.meta as
                    | {
                          hasMore?: Record<string, boolean>;
                          totalByType?: Record<string, number>;
                      }
                    | undefined;

                setResults((prev) => [...prev, ...list]);
                setHasMore(meta?.hasMore?.[contentType] ?? false);
                setTotalCount(meta?.totalByType?.[contentType] ?? 0);
            }
        } catch (error) {
            console.error('Load more failed:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [contentType, query, limit, results.length, hasMore, isLoadingMore]);

    const debouncedSearch = useMemo(
        () => debounce(((searchQuery: string) => performSearch(searchQuery)) as (...args: unknown[]) => unknown, 300),
        [performSearch],
    );

    // Perform search when query changes
    useEffect(() => {
        const run = async () => {
            const trimmed = query.trim();
            if (trimmed.length < QUERY_MIN_LENGTH) {
                setIsLoading(true);
                setHasMore(false);
                setTotalCount(0);
                startTransition(async () => {
                    try {
                        const result = await clientTrpc.selectContentTypes.fetch({
                            contentType,
                            limit: limit,
                        });
                        // console.log( 'search' )
                        // console.log( {result} )

                        if (result && Array.isArray(result)) {
                            setResults(result as Item[]);
                        } else if (result?.serverError) {
                            console.error('Load suggestions error:', result.serverError);
                            setResults([]);
                        }
                    } catch (error) {
                        console.error('Load suggestions failed:', error);
                        setResults([]);
                    } finally {
                        setIsLoading(false);
                    }
                });
                return;
            }

            debouncedSearch(query);
        };

        run();
    }, [query, debouncedSearch, contentType, startTransition, limit]);

    const [itemInitLoading, setItemInitLoading] = useState<boolean>(false);
    // Load initial selected item if value is provided
    useEffect(() => {
        if (value && (!selectedItem || selectedItem.id !== value)) {
            // Fetch the full item data when value changes
            setItemInitLoading(true);
            startTransition(async () => {
                try {
                    const result = await clientTrpc.selectSingleContentType.fetch({
                        contentType,
                        id: value,
                    });

                    // if (result && 'data' in result && result.data) {
                    if (result) {
                        setSelectedItem(result as Item);
                    }
                } catch (error) {
                    console.error('Error loading content type:', error);
                    setSelectedItem(null);
                } finally {
                    setItemInitLoading(false);
                }
            });
        } else if (!value && selectedItem) {
            setSelectedItem(null);
        }
    }, [value, contentType]);

    const handleSelect = useCallback(
        (item: Item) => {
            setSelectedItem(item);
            setOpen(false);
            setQuery('');
            if (onChange) {
                onChange(item.id);
            }
        },
        [onChange],
    );

    const handleClear = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setSelectedItem(null);
            if (onChange) {
                onChange(null);
            }
        },
        [onChange],
    );

    // Get display value for the trigger button
    const triggerContent = useMemo((): string => {
        if (itemInitLoading) return 'Loading...';
        if (!selectedItem) return placeholder;
        if (displayField && selectedItem[displayField]) {
            const res = selectedItem[displayField];
            if (typeof res === 'string') {
                return res;
            }
            return JSON.stringify(res);
        }
        return JSON.stringify(selectedItem.name || selectedItem.email || selectedItem.title || selectedItem.id);
    }, [selectedItem, displayField, placeholder, itemInitLoading]);

    console.log({ results });

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    aria-label="Select content type"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        'justify-between',
                        disabled && 'pointer-events-none opacity-50',
                        !selectedItem && 'text-muted-foreground',
                        className,
                    )}
                    onBlur={onBlur}
                    disabled={disabled}
                >
                    <span className="truncate">{triggerContent}</span>
                    <div className="ml-2 flex shrink-0 items-center gap-1">
                        {selectedItem && !noClear && (
                            <div
                                className="hover:bg-background hover:border-border cursor-pointer rounded-sm border border-transparent p-0.5 opacity-50 transition-all duration-200 hover:opacity-100"
                                onClick={handleClear}
                            >
                                <Icon name="X" className="h-4 w-4" />
                            </div>
                        )}
                        <Icon name="ChevronDown" className="h-4 w-4 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        isLoading={isLoading || isPending}
                        placeholder={placeholder}
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        {isLoading || isPending ? (
                            <div className="flex items-center justify-center p-4">
                                <Icon name="Loader" className="text-muted-foreground h-6 w-6 animate-spin" />
                            </div>
                        ) : results.length === 0 ? (
                            <CommandEmpty>{emptyText}</CommandEmpty>
                        ) : (
                            <>
                                <CommandGroup>
                                    {results.map((item) => (
                                        <CommandItem
                                            key={item.id}
                                            value={item.id}
                                            onSelect={() => handleSelect(item)}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="flex-1">
                                                {renderItem ? renderItem(item) : defaultRenderItem(item)}
                                            </div>
                                            {selectedItem?.id === item.id && <Icon name="Check" className="h-4 w-4" />}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                {hasMore && (
                                    <div className="border-t p-2">
                                        <Button
                                            aria-label="Load more"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-xs"
                                            onClick={loadMore}
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
                                                    Load more ({results.length} of {totalCount})
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
