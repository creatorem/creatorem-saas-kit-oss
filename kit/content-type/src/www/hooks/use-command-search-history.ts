'use client';

import { useLocalStorage } from '@kit/ui/hooks/use-local-storage';
import { useCallback, useMemo } from 'react';
import type { ContentType } from '../../shared/types';

const HISTORY_STORAGE_KEY = 'command-search-history';
const MAX_HISTORY_ITEMS = 5;

type Item = {
    id: string;
    updatedAt?: string | null;
    createdAt?: string | null;
    [key: string]: unknown;
};

type HistoryItem<Keys extends ContentType[]> = {
    type: Keys[number];
    item: Item;
    timestamp: number;
};

// Base type for all history items stored in localStorage
type StoredHistoryItem = {
    type: ContentType;
    item: Item;
    timestamp: number;
};

interface UseCommandSearchHistoryOptions<Keys extends ContentType[]> {
    contentTypes: Keys;
}

export function useCommandSearchHistory<Keys extends ContentType[]>({
    contentTypes,
}: UseCommandSearchHistoryOptions<Keys>) {
    // Use the useLocalStorage hook to manage history
    const [allHistory, setAllHistory] = useLocalStorage<StoredHistoryItem[]>(HISTORY_STORAGE_KEY, []);

    // Filter history by current content types
    const history = useMemo(() => {
        return allHistory.filter((h: StoredHistoryItem) =>
            contentTypes.includes(h.type as Keys[number]),
        ) as HistoryItem<Keys>[];
    }, [allHistory, contentTypes]);

    const addToHistory = useCallback(
        (type: Keys[number], item: Item) => {
            setAllHistory((prev: StoredHistoryItem[]) => {
                // Remove existing entry with same type and id
                const filtered = prev.filter((h: StoredHistoryItem) => !(h.type === type && h.item.id === item.id));

                // Add new entry at the beginning
                const newHistory: StoredHistoryItem[] = [
                    {
                        type: type as ContentType,
                        item,
                        timestamp: Date.now(),
                    },
                    ...filtered,
                ];

                // Keep only MAX_HISTORY_ITEMS
                return newHistory.slice(0, MAX_HISTORY_ITEMS);
            });
        },
        [setAllHistory],
    );

    return {
        history,
        addToHistory,
    };
}
