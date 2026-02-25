/**
 * To use filters that gonna be used in server and client environment.
 * Built to enqueue package translations.
 */

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

type GetCrossEnvFilterSlug<T extends FilterSlug> = T extends `cross_env_${string}` ? T : never;
type CrossEnvFilterSlug = GetCrossEnvFilterSlug<FilterSlug>;

const crossEnvFilters = {};
const crossEnvFilterEngine = new FilterEngine(crossEnvFilters);

export const enqueueCrossEnvFilter = <T extends CrossEnvFilterSlug>(filter: T, newFilter: Filter<T>) => {
    crossEnvFilterEngine.addFilter(filter, newFilter);
};

export const removeCrossEnvFilter = <T extends CrossEnvFilterSlug>(filter: T, name: string) => {
    crossEnvFilterEngine.removeFilter(filter, name);
};

export const applyCrossEnvFilter = <T extends CrossEnvFilterSlug & SyncFilterSlug>(
    tag: T,
    value: ReturnType<FilterCallback<T>>,
    ...args: ConditionalFilterParamsOptions<T>
) => {
    const options = (args?.[0] ?? {}) as FilterOptions<T>;
    return crossEnvFilterEngine.applyFilter(tag, value, options);
};

/**
 * Apply an async filter. Awaits each callback sequentially.
 */
export const applyCrossEnvAsyncFilter = async <T extends CrossEnvFilterSlug>(
    tag: T,
    value: Awaited<ReturnType<AsyncFilterCallback<T>>>,
    ...args: ConditionalFilterParamsOptions<T>
): Promise<ReturnType<AsyncFilterCallback<T>>> => {
    const options = (args?.[0] ?? {}) as FilterOptions<T>;
    return crossEnvFilterEngine.applyAsyncFilter(tag, value, options);
};
