'use client';

import { useFilters } from './use-filters';

/**
 * We need this client component because `clientTrpc` is 'client only'
 */
export const InitClientFilters: React.FC<React.PropsWithChildren> = ({ children }) => {
    useFilters();
    return children;
};
