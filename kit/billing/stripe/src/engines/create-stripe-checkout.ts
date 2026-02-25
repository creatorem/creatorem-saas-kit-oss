import type { createCheckoutSessionSchema } from '@kit/billing-types/schema';
import type { Stripe } from 'stripe';
import { z } from 'zod';

export async function createStripeCheckout(
    stripe: Stripe,
    {
        attachedEntityId,
        config,
        price,
        customerId: customer,
        returnUrl,
        ...params
    }: z.infer<typeof createCheckoutSessionSchema>,
) {
    const isSubscription = price.type === 'recurring';

    const trialDays: number | undefined = price.recurring.trialPeriodDays ?? undefined;

    const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData | undefined = isSubscription
        ? {
              trial_period_days: trialDays,
              metadata: params.metadata,
              trial_settings: trialDays
                  ? {
                        end_behavior: {
                            missing_payment_method: 'cancel' as const,
                        },
                    }
                  : undefined,
          }
        : {};

    const customerData = customer
        ? {
              customer,
          }
        : params.customerEmail
          ? {
                customer_email: params.customerEmail,
            }
          : {};

    const lineItems = [price].map((item) => {
        if (item.type === 'metered') {
            return {
                price: item.id,
            };
        }

        const quantity =
            params.variantQuantities.find((variant) => {
                return variant.variantId === item.id;
            })?.quantity ?? 1;

        return {
            price: item.id,
            quantity,
        };
    });

    return stripe.checkout.sessions.create({
        mode: isSubscription ? 'subscription' : 'payment',
        allow_promotion_codes: params.enableDiscount,
        line_items: lineItems,
        client_reference_id: attachedEntityId ?? undefined,
        subscription_data: subscriptionData,
        expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        payment_method_collection: trialDays ? 'if_required' : undefined,
        customer_creation: isSubscription || customer ? undefined : 'always',
        ...(config.checkoutUI === 'embedded'
            ? {
                  ui_mode: 'embedded',
                  return_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
              }
            : config.checkoutUI === 'hosted'
              ? {
                    ui_mode: 'hosted',
                    cancel_url: config.goBackUrl,
                    success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
                }
              : {}),
        ...customerData,
    });
}
