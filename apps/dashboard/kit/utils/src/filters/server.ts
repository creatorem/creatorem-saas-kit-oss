import 'server-only';

import {
    type AsyncFilterCallback,
    type ConditionalFilterParamsOptions,
    Filter,
    type FilterCallback,
    FilterEngine,
    FilterOptions,
    type FilterSlug,
    SyncFilterSlug,
} from './filter-engine';

export * from './filter-engine';
export * from './list';

type GetServerFilterSlug<T extends FilterSlug> = T extends `server_${string}` ? T : never;
type ServerFilterSlug = GetServerFilterSlug<FilterSlug>;

const serverFilters = {};
const serverFilterEngine = new FilterEngine(serverFilters);

export const enqueueServerFilter = <T extends ServerFilterSlug>(filter: T, newFilter: Filter<T>) => {
    serverFilterEngine.addFilter(filter, newFilter);
};

export const removeServerFilter = <T extends ServerFilterSlug>(filter: T, name: string) => {
    serverFilterEngine.removeFilter(filter, name);
};

export const applyServerFilter = <T extends ServerFilterSlug & SyncFilterSlug>(
    tag: T,
    value: ReturnType<FilterCallback<T>>,
    ...args: ConditionalFilterParamsOptions<T>
) => {
    const options = (args?.[0] ?? {}) as FilterOptions<T>;
    return serverFilterEngine.applyFilter(tag, value, options);
};

/**
 * Apply an async filter. Awaits each callback sequentially.
 */
export const applyServerAsyncFilter = async <T extends ServerFilterSlug>(
    tag: T,
    value: Awaited<ReturnType<AsyncFilterCallback<T>>>,
    ...args: ConditionalFilterParamsOptions<T>
): Promise<ReturnType<AsyncFilterCallback<T>>> => {
    const options = (args?.[0] ?? {}) as FilterOptions<T>;
    return serverFilterEngine.applyAsyncFilter(tag, value, options);
};
