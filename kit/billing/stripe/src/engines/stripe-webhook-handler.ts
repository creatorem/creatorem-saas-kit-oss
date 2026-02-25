import {
    AbstractBillingWebhookHandler,
    BillingConfig,
    BillingProvider,
    PriceTypeMap,
    UpsertOrderParams,
    UpsertSubscriptionParams,
} from '@kit/billing-types';
import { envs } from '@kit/stripe/envs';
import { logger } from '@kit/utils';
import type Stripe from 'stripe';
import { stripeServerEnvSchema } from '../schema/stripe-server-env.schema';
import { createStripeClient } from './stripe-server';
import { createStripeSubscriptionPayloadBuilderEngine } from './stripe-subscription-payload-builder';

export class StripeWebhookHandlerEngine implements AbstractBillingWebhookHandler {
    private stripe: Stripe | undefined;
    private readonly config: BillingConfig;

    constructor(
        config: BillingConfig,
        private readonly planTypesMap: PriceTypeMap,
    ) {
        this.config = config;
        this.planTypesMap = planTypesMap;
    }

    private readonly provider: BillingProvider = 'stripe';

    private readonly namespace = 'billing.stripe';

    async verifyWebhookSignature(request: Request) {
        const body = await request.clone().text();
        const signatureKey = `stripe-signature`;
        const signature = request.headers.get(signatureKey)!;

        const { webhooksSecret } = stripeServerEnvSchema.parse({
            secretKey: envs().STRIPE_SECRET_KEY,
            webhooksSecret: envs().STRIPE_WEBHOOK_SECRET,
        });

        const stripe = await this.loadStripe();

        const event = await stripe.webhooks.constructEventAsync(body, signature, webhooksSecret);

        if (!event) {
            throw new Error('Invalid signature');
        }

        return event;
    }

    async handleWebhookEvent(
        event: Stripe.Event,
        params: {
            onCheckoutSessionCompleted: (data: UpsertSubscriptionParams | UpsertOrderParams) => Promise<unknown>;
            onSubscriptionUpdated: (data: UpsertSubscriptionParams) => Promise<unknown>;
            onSubscriptionDeleted: (subscriptionId: string) => Promise<unknown>;
            onPaymentSucceeded: (sessionId: string) => Promise<unknown>;
            onPaymentFailed: (sessionId: string) => Promise<unknown>;
            onInvoicePaid: (data: UpsertSubscriptionParams) => Promise<unknown>;
            onEvent?(event: Stripe.Event): Promise<unknown>;
        },
    ) {
        if (params.onEvent) {
            await params.onEvent(event);
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                return await this.handleCheckoutSessionCompleted(event, params.onCheckoutSessionCompleted);
            }

            case 'customer.subscription.updated': {
                return await this.handleSubscriptionUpdatedEvent(event, params.onSubscriptionUpdated);
            }

            case 'customer.subscription.deleted': {
                return await this.handleSubscriptionDeletedEvent(event, params.onSubscriptionDeleted);
            }

            case 'checkout.session.async_payment_failed': {
                return await this.handleAsyncPaymentFailed(event, params.onPaymentFailed);
            }

            case 'checkout.session.async_payment_succeeded': {
                return await this.handleAsyncPaymentSucceeded(event, params.onPaymentSucceeded);
            }

            case 'invoice.paid': {
                return await this.handleInvoicePaid(event, params.onInvoicePaid);
            }

            default: {
                logger.debug(
                    {
                        eventType: event.type,
                        namespace: this.namespace,
                    },
                    `Unhandled Stripe event type: ${event.type}`,
                );

                return;
            }
        }
    }

    private async handleCheckoutSessionCompleted(
        event: Stripe.CheckoutSessionCompletedEvent,
        onCheckoutCompletedCallback: (data: UpsertSubscriptionParams | UpsertOrderParams) => Promise<unknown>,
    ) {
        const stripe = await this.loadStripe();

        const session = event.data.object;
        const isSubscription = session.mode === 'subscription';

        // null if access is public (user still not created)
        const accountId = session.client_reference_id;
        const customerId = session.customer as string;

        console.log('STRIPE SESSION COMPLETED');
        console.log({ session });

        if (isSubscription) {
            const subscriptionPayloadBuilderEngine = createStripeSubscriptionPayloadBuilderEngine();

            const subscriptionId = session.subscription as string;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);

            const periodStartsAt = subscriptionPayloadBuilderEngine.getPeriodStartsAt(subscription);

            const periodEndsAt = subscriptionPayloadBuilderEngine.getPeriodEndsAt(subscription);

            const lineItems = this.getLineItems(subscription);

            const payload = subscriptionPayloadBuilderEngine.build({
                customer_details: session.customer_details,
                accountId,
                customerId,
                id: subscription.id,
                lineItems,
                status: subscription.status,
                currency: subscription.currency,
                periodStartsAt,
                periodEndsAt,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                trialStartsAt: subscription.trial_start,
                trialEndsAt: subscription.trial_end,
            });

            return onCheckoutCompletedCallback(payload);
        } else {
            const sessionId = event.data.object.id;

            const sessionWithLineItems = await stripe.checkout.sessions.retrieve(event.data.object.id, {
                expand: ['line_items'],
            });

            const lineItems = sessionWithLineItems.line_items?.data ?? [];
            const paymentStatus = sessionWithLineItems.payment_status;
            const status = paymentStatus === 'unpaid' ? 'pending' : 'succeeded';
            const currency = event.data.object.currency as string;

            const payload: UpsertOrderParams = {
                customer_details: session.customer_details,
                targeted_account_id: accountId,
                target_customer_id: customerId,
                target_order_id: sessionId,
                billing_provider: this.provider,
                status: status,
                currency: currency,
                total_amount: sessionWithLineItems.amount_total ?? 0,
                line_items: lineItems.map((item) => {
                    const price = item.price as Stripe.Price;

                    return {
                        id: item.id,
                        product_id: price.product as string,
                        variant_id: price.id,
                        price_amount: price.unit_amount,
                        quantity: item.quantity,
                    };
                }),
            };

            return onCheckoutCompletedCallback(payload);
        }
    }

    private handleAsyncPaymentFailed(
        event: Stripe.CheckoutSessionAsyncPaymentFailedEvent,
        onPaymentFailed: (sessionId: string) => Promise<unknown>,
    ) {
        const sessionId = event.data.object.id;

        return onPaymentFailed(sessionId);
    }

    private handleAsyncPaymentSucceeded(
        event: Stripe.CheckoutSessionAsyncPaymentSucceededEvent,
        onPaymentSucceeded: (sessionId: string) => Promise<unknown>,
    ) {
        const sessionId = event.data.object.id;

        return onPaymentSucceeded(sessionId);
    }

    private async handleSubscriptionUpdatedEvent(
        event: Stripe.CustomerSubscriptionUpdatedEvent,
        onSubscriptionUpdatedCallback: (subscription: UpsertSubscriptionParams) => Promise<unknown>,
    ) {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        const accountId = subscription.metadata.accountId as string;

        const subscriptionPayloadBuilderEngine = createStripeSubscriptionPayloadBuilderEngine();

        const periodStartsAt = subscriptionPayloadBuilderEngine.getPeriodStartsAt(subscription);

        const periodEndsAt = subscriptionPayloadBuilderEngine.getPeriodEndsAt(subscription);

        const lineItems = this.getLineItems(subscription);

        const payload = subscriptionPayloadBuilderEngine.build({
            customer_details: null,
            customerId: subscription.customer as string,
            id: subscriptionId,
            accountId,
            lineItems,
            status: subscription.status,
            currency: subscription.currency,
            periodStartsAt,
            periodEndsAt,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            trialStartsAt: subscription.trial_start,
            trialEndsAt: subscription.trial_end,
        });

        return onSubscriptionUpdatedCallback(payload);
    }

    private handleSubscriptionDeletedEvent(
        event: Stripe.CustomerSubscriptionDeletedEvent,
        onSubscriptionDeletedCallback: (subscriptionId: string) => Promise<unknown>,
    ) {
        return onSubscriptionDeletedCallback(event.data.object.id);
    }

    private async handleInvoicePaid(
        event: Stripe.InvoicePaidEvent,
        onInvoicePaid: (data: UpsertSubscriptionParams) => Promise<unknown>,
    ) {
        const stripe = await this.loadStripe();

        const subscriptionPayloadBuilderEngine = createStripeSubscriptionPayloadBuilderEngine();

        const invoice = event.data.object;
        const invoiceId = invoice.id;

        if (!invoiceId) {
            logger.warn(
                {
                    invoiceId,
                },
                `Invoice not found. 'invoice.paid' webhook event will not be handled.`,
            );

            return;
        }

        const customerId = invoice.customer as string;

        let subscriptionId: string | undefined;

        if ('subscription' in invoice && invoice.subscription) {
            subscriptionId = invoice.subscription as string;
        } else {
            const parent = (invoice as unknown as { parent?: { subscription_details?: { subscription?: string } } })
                .parent;
            subscriptionId = parent?.subscription_details?.subscription as string | undefined;
        }

        if (!subscriptionId) {
            logger.warn(
                {
                    subscriptionId,
                    customerId,
                },
                `Subscription ID not found for invoice. 'invoice.paid' webhook event will not be handled.`,
            );

            return;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        if (!subscription) {
            logger.warn(
                {
                    subscriptionId,
                    customerId,
                },
                `Subscription not found for invoice. 'invoice.paid' webhook event will not be handled.`,
            );

            return;
        }

        const accountId = subscription.metadata?.accountId as string;

        const periodStartsAt = subscriptionPayloadBuilderEngine.getPeriodStartsAt(subscription);

        const periodEndsAt = subscriptionPayloadBuilderEngine.getPeriodEndsAt(subscription);

        const lineItems = this.getLineItems(subscription);

        const payload = subscriptionPayloadBuilderEngine.build({
            customer_details: null,
            customerId,
            id: subscriptionId,
            accountId,
            lineItems,
            status: subscription.status,
            currency: subscription.currency,
            periodStartsAt,
            periodEndsAt,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            trialStartsAt: subscription.trial_start,
            trialEndsAt: subscription.trial_end,
        });

        return onInvoicePaid(payload);
    }

    private getLineItems(subscription: Stripe.Subscription) {
        return subscription.items.data.map((item) => {
            let type = this.planTypesMap.get(item.price.id);

            if (!type) {
                console.warn(
                    {
                        lineItemId: item.id,
                    },
                    `The line item ${item.id} is not in the billing configuration.`,
                );

                type = 'flat' as const;
            }

            return { ...item, type };
        });
    }

    private async loadStripe() {
        if (!this.stripe) {
            this.stripe = await createStripeClient();
        }

        return this.stripe;
    }
}
