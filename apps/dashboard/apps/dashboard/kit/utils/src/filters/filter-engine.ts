import type { Environment } from '../detect-env';
import { getEnvironment } from '../detect-env';
import type { FilterList } from './list';

export type FilterSlug = keyof FilterList;

type GetAsyncFilters<T> = {
    [K in keyof T as T[K] extends { asyncable: true } ? K : never]: T[K];
};

type AsyncFilters = GetAsyncFilters<FilterList>;
export type AsyncFilterSlug = keyof AsyncFilters;
export type SyncFilterSlug = Exclude<FilterSlug, keyof AsyncFilters>;

type FilterContext = {
    /**
     * The environment of the event.
     * nodejs: Node.js (server-side)
     * edge: Nextjs proxy (server-side)
     * browser: Browser (client-side)
     * mobile: React Native (client-side)
     */
    environment: Environment;
    /**
     * The time of the event.
     */
    time: Date;
};

export type FilterOptions<T extends FilterSlug> = Omit<FilterList[T], 'return' | 'asyncable'> & {
    ctx: FilterContext;
};

type FilterReturnType<T extends FilterSlug> = FilterList[T]['return'];

export type FilterParamsOptions<T extends FilterSlug> = Omit<FilterOptions<T>, 'ctx'>;

export type FilterCallback<T extends SyncFilterSlug> = (
    value: FilterList[T]['return'],
    options: FilterOptions<T>,
) => FilterReturnType<T>;

/**
 * We use FilterSlug because sync callback are called in the async filter applier.
 */
export type AsyncFilterCallback<T extends FilterSlug> = (
    value: FilterList[T]['return'],
    options: FilterOptions<T>,
) => Promise<FilterReturnType<T>>;

export type Filter<T extends FilterSlug> = {
    name: string;
    /**
     * Lower numbers correspond with earlier execution, and functions with the same priority are executed in the order in which they were added to the filter.
     *
     * @default 10
     */
    priority?: number;
    /**
     * @default false
     */
    once?: boolean;
} & (T extends SyncFilterSlug
    ? {
          fn: FilterCallback<T>;
      }
    : T extends AsyncFilterSlug
      ? {
            fn: AsyncFilterCallback<T>;
            /**
             * Can be used when the filter is called with `useApplyAsyncFilter` or `applyAsyncFilter`.
             * An async filter applier can call non-async filters, but a non-async filter applier cannot call async filters (will throw).
             *
             * @throws When we try to call `useApplyFilter` or `applyFilter` with an `async` filter in the stack.
             */
            async: true;
        }
      : never);

export type Filters<T extends FilterSlug> = {
    [name in T]?: Record<string, Filter<T>>;
};

const DEFAULT_PRIORITY = 10;

/**
 * FilterEngine object.
 */
export class FilterEngine {
    /**
     * Registered filters.
     */
    public filters: Filters<FilterSlug> = {};

    constructor(filters: Filters<FilterSlug>) {
        this.filters = filters;
    }

    public addFilter<T extends FilterSlug>(tag: T, newFilter: Filter<T>): void {
        if (!(tag in this.filters) || !this.filters[tag]) {
            this.filters[tag] = { [newFilter.name]: newFilter };
            return;
        }

        if (!(newFilter.name in this.filters[tag])) {
            this.filters[tag] = {
                ...this.filters[tag],
                [newFilter.name]: newFilter,
            };
            return;
        }

        // to avoid unrequired react rerenders, we update only new filter objects.
        // we need to recreate a new filter object to update it.
        if (this.filters[tag][newFilter.name] !== newFilter) {
            this.filters[tag][newFilter.name] = newFilter;
        }
    }

    public removeFilter<T extends FilterSlug>(tag: T, name: string): void {
        if (tag in this.filters && this.filters[tag] && name in this.filters[tag]) {
            delete this.filters[tag][name];
        }
    }

    /**
     * Calls filters that are stored in FilterEngine.filters for a specific tag or return
     * original value if no filters exist.
     */
    public applyFilter<T extends SyncFilterSlug>(
        tag: T,
        value: FilterReturnType<T>,
        options: FilterOptions<T>,
    ): FilterReturnType<T> {
        if (!(tag in this.filters) || !this.filters[tag]) {
            return value;
        }

        const context = this.getContext();

        const callbacksArray = Object.values(this.filters[tag])
            .filter((f) => {
                if ('async' in f && f.async) {
                    throw new Error('Some filters are async');
                }
                return f;
            })
            .sort((a, b) => (a.priority ?? DEFAULT_PRIORITY) - (b.priority ?? DEFAULT_PRIORITY));

        callbacksArray.forEach(({ fn, once, name }) => {
            // @ts-expect-error
            value = fn(value, { ...options, ctx: context }) as FilterReturnType<T>;
            if (once) {
                this.removeFilter(tag, name);
            }
        });

        return value;
    }

    /**
     * We use FilterSlug because sync callback are called in the async filter applier.
     */
    public async applyAsyncFilter<T extends FilterSlug>(
        tag: T,
        value: FilterReturnType<T>,
        options: FilterOptions<T>,
    ): Promise<FilterReturnType<T>> {
        if (!this.filters[tag]) {
            return value;
        }

        const context = this.getContext();

        const callbacksArray = Object.values(Object.values(this.filters[tag])).sort(
            (a, b) => (a.priority ?? DEFAULT_PRIORITY) - (b.priority ?? DEFAULT_PRIORITY),
        );

        for (const { fn, once, name } of callbacksArray) {
            // @ts-expect-error
            value = (await fn(value as string, { ...options, ctx: context })) as FilterReturnType<T>;
            if (once) {
                this.removeFilter(tag, name);
            }
        }

        return value;
    }

    private getContext(): FilterContext {
        return {
            environment: getEnvironment(),
            time: new Date(),
        };
    }
}

export type ConditionalFilterParamsOptions<T extends FilterSlug> = keyof Omit<
    FilterParamsOptions<T>,
    'ctx'
> extends never
    ? []
    : [options: FilterParamsOptions<T>];
