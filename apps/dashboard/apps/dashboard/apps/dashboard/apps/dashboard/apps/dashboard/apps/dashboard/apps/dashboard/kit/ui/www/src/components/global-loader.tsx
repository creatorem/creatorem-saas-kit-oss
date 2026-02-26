import { LoadingOverlay } from './loading-overlay';

export function GlobalLoader({
    displayLogo = false,
    fullPage = false,
    displaySpinner = true,
    children,
}: React.PropsWithChildren<{
    displayLogo?: boolean;
    fullPage?: boolean;
    displaySpinner?: boolean;
}>) {
    return (
        <>
            {displaySpinner && (
                <div
                    className={
                        'zoom-in-80 animate-in fade-in slide-in-from-bottom-12 flex flex-1 flex-col items-center justify-center duration-500'
                    }
                >
                    <LoadingOverlay displayLogo={displayLogo} fullPage={fullPage} />

                    {children}
                </div>
            )}
        </>
    );
}
