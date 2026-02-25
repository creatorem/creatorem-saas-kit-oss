'use client';
import 'client-only';

import { useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
    ConditionalFilterParamsOptions,
    Filter,
    FilterEngine,
    FilterOptions,
    type FilterSlug,
    type Filters,
    SyncFilterSlug,
} from '../filter-engine';
import type { FilterList } from '../list';

type GetClientClientFilterSlug<T extends FilterSlug> = T extends `server_${string}` ? never : T;
export type ClientFilterSlug = GetClientClientFilterSlug<FilterSlug>;

type FilterReturnType<T extends ClientFilterSlug> = FilterList[T]['return'];

interface FilterStore {
    filters: Filters<ClientFilterSlug>;
    addFilter: <T extends ClientFilterSlug>(tag: T, newFilter: Filter<T>) => void;
    removeFilter: <T extends ClientFilterSlug>(tag: T, name: string) => void;
}

/**
 * Allow to initialize filters before the first useEffect call.
 */
const initialClientFilters = {};
const initialClientFilterEngine = new FilterEngine(initialClientFilters);

const initializeEnqueueFilter = <T extends ClientFilterSlug>(filter: T, newFilter: Filter<T>) => {
    initialClientFilterEngine.addFilter(filter, newFilter);
};

const useFilterStore = create<FilterStore>()(
    subscribeWithSelector((set, get) => ({
        // connection between `initialClientFilters` and `useFilterStore.filters` will be broken after the first addFilter (in a useEffect hook)
        filters: initialClientFilters,

        addFilter: <T extends ClientFilterSlug>(tag: T, newFilter: Filter<T>) => {
            const { filters } = get();
            const appEvent = new FilterEngine(filters as Filters<T>);
            appEvent.addFilter(tag, newFilter);

            set((state) => ({
                ...state,
                filters: appEvent.filters as Filters<T>,
            }));
        },

        removeFilter: <T extends ClientFilterSlug>(tag: T, name: string) => {
            const { filters } = get();
            const appEvent = new FilterEngine(filters as Filters<T>);
            appEvent.removeFilter(tag, name);

            set((state) => ({
                ...state,
                filters: appEvent.filters as Filters<T>,
            }));
        },
    })),
);

export function useEnqueueFilter<T extends ClientFilterSlug>(tag: T, newFilter: Filter<T>): void {
    initializeEnqueueFilter(tag, newFilter);

    useEffect(() => {
        useFilterStore.getState().addFilter(tag, newFilter);
    }, [tag, newFilter]);

    useEffect(() => {
        return () => {
            useFilterStore.getState().removeFilter(tag, newFilter.name);
        };
    }, [tag, newFilter.name]);
}

export function useApplyFilter<T extends ClientFilterSlug & SyncFilterSlug>(
    tag: T,
    value: FilterReturnType<T>,
    ...args: ConditionalFilterParamsOptions<T>
): FilterReturnType<T> {
    const tagFilters = useFilterStore((state) => state.filters[tag]);

    return useMemo(() => {
        const appEvent = new FilterEngine({ [tag]: tagFilters } as Filters<FilterSlug>);
        const options = (args?.[0] ?? {}) as FilterOptions<T>;
        return appEvent.applyFilter(tag, value, options);
    }, [value, args?.[0], tag, tagFilters]);
}

// todo: impleent useApplyAsyncFilter when we gonna need it, using use() ? or useQuery ? or useTransition ?

/* CLIENT SIDE NON HOOKS ACCESSORS */

export function enqueueFilter<T extends ClientFilterSlug>(tag: T, newFilter: Filter<T>): void {
    useFilterStore.getState().addFilter(tag, newFilter);
}

export function removeFilter<T extends ClientFilterSlug>(tag: T, name: string): void {
    useFilterStore.getState().removeFilter(tag, name);
}

export function applyFilter<T extends ClientFilterSlug & SyncFilterSlug>(
    tag: T,
    value: FilterReturnType<T>,
    ...args: ConditionalFilterParamsOptions<T>
): FilterReturnType<T> {
    const { filters } = useFilterStore.getState();
    const appEvent = new FilterEngine(filters as Filters<FilterSlug>);

    const options = (args?.[0] ?? {}) as FilterOptions<T>;
    return appEvent.applyFilter(tag, value, options);
}

export async function applyAsyncFilter<T extends ClientFilterSlug>(
    tag: T,
    value: FilterReturnType<T>,
    ...args: ConditionalFilterParamsOptions<T>
): Promise<FilterReturnType<T>> {
    const { filters } = useFilterStore.getState();
    const appEvent = new FilterEngine(filters as Filters<FilterSlug>);

    const options = (args?.[0] ?? {}) as FilterOptions<T>;
    return await appEvent.applyAsyncFilter(tag, value, options);
}
