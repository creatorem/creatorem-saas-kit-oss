'use client';

import { envs } from '@kit/stripe/envs';
import { Dialog, DialogContent, DialogTitle } from '@kit/ui/dialog';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';
import { stripeClientEnvSchema } from '../schema/stripe-client-env.schema';

const { publishableKey } = stripeClientEnvSchema.parse({
    publishableKey: envs().NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
});

const stripePromise = loadStripe(publishableKey);

export function StripeCheckout({
    checkoutToken,
    onClose,
}: React.PropsWithChildren<{
    checkoutToken: string;
    onClose?: () => void;
}>) {
    return (
        <EmbeddedCheckoutPopup key={checkoutToken} onClose={onClose}>
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{
                    clientSecret: checkoutToken,
                }}
            >
                <EmbeddedCheckout className={'EmbeddedCheckoutClassName'} />
            </EmbeddedCheckoutProvider>
        </EmbeddedCheckoutPopup>
    );
}

function EmbeddedCheckoutPopup({
    onClose,
    children,
}: React.PropsWithChildren<{
    onClose?: () => void;
}>) {
    const [open, setOpen] = useState(true);

    return (
        <Dialog
            defaultOpen
            open={open}
            onOpenChange={(open) => {
                if (!open && onClose) {
                    onClose();
                }

                setOpen(open);
            }}
        >
            <DialogContent
                style={{
                    maxHeight: '98vh',
                }}
                className={`overflow-y-auto border-none p-0 shadow-transparent`}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogTitle className={'hidden'}>Checkout</DialogTitle>
                <div>{children}</div>
            </DialogContent>
        </Dialog>
    );
}
