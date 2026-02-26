'use client';
import 'client-only';

import React from 'react';
import type { ConditionalFilterParamsOptions } from '../filter-engine';
import type { FilterList } from '../list';
import { useApplyFilter } from './use-filters';

type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type FiltersWithExactReturn<T, R> = {
    [K in keyof T as T[K] extends { return: infer Ret } ? (IsEqual<Ret, R> extends true ? K : never) : never]: T[K];
};

type ComponentableFilters = FiltersWithExactReturn<FilterList, React.ReactNode>;

type FilterApplierProps<T extends keyof ComponentableFilters> = {
    name: T;
    children?: React.ReactNode;
} & (ConditionalFilterParamsOptions<T> extends [] ? {} : { options: ConditionalFilterParamsOptions<T>[0] });

export function FilterApplier<T extends keyof ComponentableFilters>({
    name,
    children,
    ...props
}: FilterApplierProps<T>) {
    const args = 'options' in props ? [props.options] : [];
    return useApplyFilter<T>(name, children ?? null, ...(args as ConditionalFilterParamsOptions<T>));
}
