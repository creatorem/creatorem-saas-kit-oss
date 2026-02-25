import 'server-only';

import { envs } from '@kit/stripe/envs';
import { stripeServerEnvSchema } from '../schema/stripe-server-env.schema';

export async function createStripeClient() {
    const { default: Stripe } = await import('stripe');

    const stripeServerEnv = stripeServerEnvSchema.parse({
        secretKey: envs().STRIPE_SECRET_KEY,
        webhooksSecret: envs().STRIPE_WEBHOOK_SECRET,
    });

    return new Stripe(stripeServerEnv.secretKey, {
        apiVersion: '2025-08-27.basil',
        typescript: true,
    });
}
