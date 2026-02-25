import 'client-only';

import { envs } from '@kit/stripe/envs';
import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';

let stripeClientPromise: Promise<Stripe | null>;

export function getStripeClient(): Promise<Stripe | null> {
    if (!stripeClientPromise) {
        stripeClientPromise = loadStripe(envs().NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    }

    return stripeClientPromise;
}
