import React from 'react';

const MOBILE_BREAKPOINT = 1024;

export function useIsMobile(maxWidth?: number) {
    const [isMobile, setIsMobile] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        const finalMaxWidth = maxWidth ?? MOBILE_BREAKPOINT;
        const mql = window.matchMedia(`(max-width: ${finalMaxWidth - 1}px)`);
        const onChange = () => {
            setIsMobile(window.innerWidth < finalMaxWidth);
        };
        mql.addEventListener('change', onChange);
        setIsMobile(window.innerWidth < finalMaxWidth);
        return () => mql.removeEventListener('change', onChange);
    }, [maxWidth]);

    return isMobile;
}
