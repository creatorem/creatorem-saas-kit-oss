'use client';

import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import React from 'react';

export interface UseContentTableOptions {
    defaultPageSize?: number;
    defaultSortBy?: string;
    defaultSortDirection?: 'asc' | 'desc';
}

export function useContentTable({
    defaultPageSize = 20,
    defaultSortBy = 'createdAt',
    defaultSortDirection = 'desc',
}: UseContentTableOptions = {}) {
    const [search, setSearch] = useQueryStates({
        q: parseAsString.withDefault(''),
        page: parseAsInteger.withDefault(1),
        limit: parseAsInteger.withDefault(defaultPageSize),
        sortBy: parseAsString.withDefault(defaultSortBy),
        sortDirection: parseAsString.withDefault(defaultSortDirection),
    });

    const filters = React.useMemo(
        () => ({
            search: search.q,
            page: search.page,
            limit: search.limit,
            sortBy: search.sortBy,
            sortDirection: search.sortDirection as 'asc' | 'desc',
        }),
        [search],
    );

    const updateSearch = React.useCallback(
        (newSearch: string) => {
            setSearch({ q: newSearch, page: 1 });
        },
        [setSearch],
    );

    const updatePage = React.useCallback(
        (newPage: number) => {
            setSearch({ page: newPage });
        },
        [setSearch],
    );

    const updateSort = React.useCallback(
        (sortBy: string, sortDirection: 'asc' | 'desc') => {
            setSearch({ sortBy, sortDirection, page: 1 });
        },
        [setSearch],
    );

    const resetFilters = React.useCallback(() => {
        setSearch({
            q: '',
            page: 1,
            limit: defaultPageSize,
            sortBy: defaultSortBy,
            sortDirection: defaultSortDirection,
        });
    }, [setSearch, defaultPageSize, defaultSortBy, defaultSortDirection]);

    return {
        filters,
        updateSearch,
        updatePage,
        updateSort,
        resetFilters,
        setSearch,
    };
}
