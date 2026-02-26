import React from 'react';
import { useCallbackRef } from './use-callback-ref';

export enum MediaQueries {
    SmUp = '(min-width: 640px)',
    MdUp = '(min-width: 768px)',
    LgUp = '(min-width: 1024px)',
    XlUp = '(min-width: 1280px)',
    TwoXlUp = '(min-width: 1536px)',

    SmDown = '(max-width: 640px)',
    MdDown = '(max-width: 768px)',
    LgDown = '(max-width: 1024px)',
    XlDown = '(max-width: 1280px)',
    TwoXlDown = '(max-width: 1536px)',
}

type MediaQueryCallback = (event: MediaQueryListEvent) => void;

function listen(query: MediaQueryList, callback: MediaQueryCallback) {
    try {
        query.addEventListener('change', callback);
        return () => query.removeEventListener('change', callback);
    } catch {
        query.addListener(callback);
        return () => query.removeListener(callback);
    }
}

export type UseMediaQueryOptions = {
    fallback?: boolean;
    ssr?: boolean;
    getWindow?(): typeof window;
};

export function useMediaQuery(query: string, options: UseMediaQueryOptions = {}): boolean {
    const { fallback, ssr = true, getWindow } = options;
    const getWin = useCallbackRef(getWindow);
    const [value, setValue] = React.useState(() => ({
        media: query,
        matches: !ssr ? (getWin() ?? window).matchMedia?.(query)?.matches : !!fallback,
    }));

    React.useEffect(() => {
        const win = getWin() ?? window;
        setValue((prev) => {
            const current = {
                media: query,
                matches: win.matchMedia(query).matches,
            };

            return prev.matches === current.matches && prev.media === current.media ? prev : current;
        });

        const handler = (evt: MediaQueryListEvent) => {
            setValue((prev) => {
                if (prev.media === evt.media) {
                    return { ...prev, matches: evt.matches };
                }
                return prev;
            });
        };

        const cleanup = listen(win.matchMedia(query), handler);

        return () => cleanup();
        // eslint-disable-next-line
    }, [getWin]);

    return value.matches;
}
