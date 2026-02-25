import type { TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@kit/ui/command';
import { ActionSheet, ActionSheetContent, ActionSheetTrigger } from '@kit/native-ui/action-sheet';
import { Icon } from '@kit/native-ui/icon';
import { Pressable } from '@kit/native-ui/react-native';
import { Text } from '@kit/native-ui/text';
import { cn, debounce } from '@kit/utils';
import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { TextInput, View } from 'react-native';
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
        <View className="flex flex-col">
            <Text className="font-medium">{displayName as string}</Text>
            {displaySubtext && <Text className="text-muted-foreground text-xs">{displaySubtext as string}</Text>}
        </View>
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
                console.log({ result });

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
            console.log({ result });

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
                    console.log('selectSingleContentType');

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

    const handleClear = useCallback(() => {
        setSelectedItem(null);
        if (onChange) {
            onChange(null);
        }
    }, [onChange]);

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

    return (
        <ActionSheet open={open} onOpenChange={setOpen}>
            <ActionSheetTrigger
                aria-label="Select content type"
                role="combobox"
                aria-expanded={open}
                className={cn(
                    'flex h-12 flex-row items-center justify-between rounded-xl border px-3',
                    open ? 'border-black dark:border-white' : 'border-input',
                    disabled && 'pointer-events-none opacity-50',
                    !selectedItem && 'text-muted-foreground',
                    className,
                )}
                onBlur={onBlur}
                disabled={disabled}
            >
                <Text className="truncate">{triggerContent}</Text>
                {/* {triggerContent} */}
                <View className="ml-2 flex shrink-0 items-center gap-1">
                    {selectedItem && !noClear && (
                        <Pressable
                            className="rounded-sm border border-transparent p-0.5 opacity-50"
                            onPress={handleClear}
                        >
                            <Icon name="X" className="h-4 w-4" />
                        </Pressable>
                    )}
                    <Icon name="ChevronDown" className="h-4 w-4" />
                </View>
            </ActionSheetTrigger>
            <ActionSheetContent>
                <View className="p-4 pt-2 pb-8">
                    <TextInput
                        // isLoading={isLoading || isPending}
                        // variant="classic"
                        placeholder={placeholder}
                        className="text-foreground h-10"
                        value={query}
                        onChangeText={setQuery}
                        // onValueChange={setQuery}
                    />
                    {/* <ThemedScroller className="flex-1"> */}
                    <View className="flex gap-2">
                        {results.map((item) => (
                            <Pressable
                                key={item.id}
                                onPress={() => handleSelect(item)}
                                className="flex flex-row items-center gap-2"
                            >
                                <View className="flex-1">
                                    {renderItem ? renderItem(item) : defaultRenderItem(item)}
                                </View>
                                {selectedItem?.id === item.id && <Icon name="Check" className="h-4 w-4" />}
                            </Pressable>
                        ))}
                    </View>
                    {/* </ThemedScroller> */}
                    {/* <CommandList>
                        {isLoading || isPending ? (
                            <View className="flex items-center justify-center p-4">
                                <Icon name="Loader" className="text-muted-foreground h-6 w-6 animate-spin" />
                            </View>
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
                                            <View className="flex-1">
                                                {renderItem ? renderItem(item) : defaultRenderItem(item)}
                                            </View>
                                            {selectedItem?.id === item.id && (
                                                <Icon name="Check" className="h-4 w-4" />
                                            )}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                {hasMore && (
                                    <View className="border-t p-2">
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
                                                    <Icon
                                                        name="Loader"
                                                        className="mr-2 h-3 w-3 animate-spin"
                                                    />
                                                    <Text>Loading...</Text>
                                                </>
                                            ) : (
                                                <>
                                                    <Icon name="ChevronDown" className="mr-2 h-3 w-3" />
                                                    <Text>
                                                        Load more ({results.length} of {totalCount})
                                                    </Text>
                                                </>
                                            )}
                                        </Button>
                                    </View>
                                )}
                            </>
                        )}
                    </CommandList> */}
                </View>
            </ActionSheetContent>
        </ActionSheet>
    );
}
