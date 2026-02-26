import { useEffect } from 'react';

type UseNavigationAutoCloseOptions = {
    disabled?: boolean;
    onLoadHostPage: () => void;
};

/**
 * Closes a mobile UI container (e.g., drawer) on in-app navigations, mirroring nextjs-toploader's hooks.
 * - Closes on same-host anchor clicks (normal navigations)
 * - Closes on programmatic navigations via history.pushState / history.replaceState
 * - Closes on back/forward via popstate
 */
export function useNavigationAutoClose({ disabled = false, onLoadHostPage }: UseNavigationAutoCloseOptions) {
    useEffect(() => {
        if (disabled) return;

        const toAbsoluteURL = (href: string) => new URL(href, window.location.href).href;

        const isSameHostName = (aHref: string, bHref: string) => {
            const aUrl = new URL(toAbsoluteURL(aHref));
            const bUrl = new URL(toAbsoluteURL(bHref));
            const normalizeHost = (host: string) => host.replace(/^www\./, '');
            return normalizeHost(aUrl.hostname) === normalizeHost(bUrl.hostname);
        };

        const findClosestAnchor = (element: HTMLElement | null): HTMLAnchorElement | null => {
            let node: HTMLElement | null = element;
            while (node && node.tagName.toLowerCase() !== 'a') node = node.parentElement;
            return node as HTMLAnchorElement | null;
        };

        function handleDocumentClick(event: MouseEvent) {
            try {
                const anchor = findClosestAnchor(event.target as HTMLElement | null);
                const href = anchor?.getAttribute('href') ?? anchor?.href;
                if (!anchor || !href) return;

                if (!isSameHostName(window.location.href, anchor.href)) return;

                const targetBlank = anchor.getAttribute('target') === '_blank';
                const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
                const isSpecialScheme = ['tel:', 'mailto:', 'sms:', 'blob:', 'download:'].some((prefix) =>
                    href.startsWith(prefix),
                );
                const isHttpLike = toAbsoluteURL(anchor.href).startsWith('http');

                if (targetBlank || isModifiedClick || isSpecialScheme || !isHttpLike) return;

                onLoadHostPage();
            } catch {
                // ignore
            }
        }

        const historyRef = window.history;
        const originalPushState = historyRef.pushState.bind(historyRef);
        const originalReplaceState = historyRef.replaceState.bind(historyRef);

        historyRef.pushState = ((...args: Parameters<History['pushState']>) => {
            onLoadHostPage();
            return originalPushState(...args);
        }) as typeof historyRef.pushState;

        historyRef.replaceState = ((...args: Parameters<History['replaceState']>) => {
            onLoadHostPage();
            return originalReplaceState(...args);
        }) as typeof historyRef.replaceState;

        function handlePopState() {
            onLoadHostPage();
        }

        document.addEventListener('click', handleDocumentClick);
        window.addEventListener('popstate', handlePopState);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
            window.removeEventListener('popstate', handlePopState);
            historyRef.pushState = originalPushState;
            historyRef.replaceState = originalReplaceState;
        };
    }, [disabled, onLoadHostPage]);
}
