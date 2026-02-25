import { BillingProvider } from '@kit/billing-types';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { forwardRef, lazy, memo, Suspense, useMemo } from 'react';

const Fallback = <LoadingOverlay fullPage={false} />;

export function EmbeddedCheckout(
    props: React.PropsWithChildren<{
        checkoutToken: string;
        provider: BillingProvider;
        onClose?: () => void;
    }>,
) {
    const CheckoutComponent = useMemo(() => loadCheckoutComponent(props.provider), [props.provider]);

    return (
        <>
            <CheckoutComponent onClose={props.onClose} checkoutToken={props.checkoutToken} />

            <BlurryBackdrop />
        </>
    );
}

function loadCheckoutComponent(provider: BillingProvider) {
    switch (provider) {
        case 'stripe': {
            return buildLazyComponent(() => {
                return import('@kit/stripe/components').then(({ StripeCheckout }) => {
                    return {
                        default: StripeCheckout,
                    };
                });
            });
        }

        case 'lemon-squeezy': {
            return buildLazyComponent(() => {
                return import('@kit/lemon-squeezy/components').then(({ LemonSqueezyEmbeddedCheckout }) => {
                    return {
                        default: LemonSqueezyEmbeddedCheckout,
                    };
                });
            });
        }

        default:
            throw new Error(`Unsupported provider: ${provider as string}`);
    }
}

function buildLazyComponent<
    Component extends React.ComponentType<{
        onClose: (() => unknown) | undefined;
        checkoutToken: string;
    }>,
>(
    load: () => Promise<{
        default: Component;
    }>,
    fallback = Fallback,
) {
    let LoadedComponent: ReturnType<typeof lazy<Component>> | null = null;

    const LazyComponent = forwardRef<
        React.ComponentRef<'div'>,
        {
            onClose: (() => unknown) | undefined;
            checkoutToken: string;
        }
    >(function LazyDynamicComponent(props, ref) {
        if (!LoadedComponent) {
            LoadedComponent = lazy(load);
        }

        return (
            <Suspense fallback={fallback}>
                {/* @ts-expect-error: weird TS */}
                <LoadedComponent onClose={props.onClose} checkoutToken={props.checkoutToken} ref={ref} />
            </Suspense>
        );
    });

    return memo(LazyComponent);
}

function BlurryBackdrop() {
    return <div className={'bg-background/30 fixed top-0 left-0 w-full backdrop-blur-xs' + ' m-0! h-full'} />;
}
