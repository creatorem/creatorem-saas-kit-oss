import 'server-only';

import type { AbstractBillingEntity, AbstractBillingWebhookHandler, WebhookHandlersParams } from '@kit/billing-types';
import { AppClient } from '@kit/db';
import { logger } from '@kit/utils';

export class BillingWebhookHandler {
    private readonly namespace = 'billing';
    private readonly getDB: () => Promise<AppClient>;
    private readonly webhookHandler: AbstractBillingWebhookHandler;
    private readonly billingEntity: AbstractBillingEntity;

    constructor(
        getDB: () => Promise<AppClient>,
        webhookHandler: AbstractBillingWebhookHandler,
        billingEntity: AbstractBillingEntity,
    ) {
        this.getDB = getDB;
        this.webhookHandler = webhookHandler;
        this.billingEntity = billingEntity;
    }

    async handleWebhookEvent(request: Request, params: Partial<WebhookHandlersParams> = {}) {
        const event = await this.webhookHandler.verifyWebhookSignature(request);

        if (!event) {
            throw new Error('Invalid signature');
        }

        const WebhookHandlersParams = await this.billingEntity.getWebhookHandlersParams();

        const db = await this.getDB();

        return this.webhookHandler.handleWebhookEvent(event, {
            onSubscriptionDeleted: async (subscriptionId: string) => {
                const ctx = {
                    namespace: this.namespace,
                    subscriptionId,
                };

                logger.info(ctx, 'Processing subscription deleted event...');

                if (WebhookHandlersParams.onSubscriptionDeleted) {
                    await WebhookHandlersParams.onSubscriptionDeleted(db, subscriptionId);
                }

                if (params.onSubscriptionDeleted) {
                    await params.onSubscriptionDeleted(db, subscriptionId);
                }

                logger.info(ctx, 'Successfully deleted subscription');
            },
            onSubscriptionUpdated: async (subscription) => {
                const ctx = {
                    namespace: this.namespace,
                    subscriptionId: subscription.target_subscription_id,
                    provider: subscription.billing_provider,
                    accountId: subscription.targeted_account_id,
                    customerId: subscription.target_customer_id,
                };

                logger.info(ctx, 'Processing subscription updated event ...');

                if (WebhookHandlersParams.onSubscriptionUpdated) {
                    await WebhookHandlersParams.onSubscriptionUpdated(db, subscription);
                }

                if (params.onSubscriptionUpdated) {
                    await params.onSubscriptionUpdated(db, subscription);
                }

                logger.info(ctx, 'Successfully updated subscription');
            },
            onCheckoutSessionCompleted: async (payload) => {
                if (WebhookHandlersParams.onCheckoutSessionCompleted) {
                    await WebhookHandlersParams.onCheckoutSessionCompleted(db, payload, payload.target_customer_id);
                }

                if ('target_order_id' in payload) {
                    const ctx = {
                        namespace: this.namespace,
                        orderId: payload.target_order_id,
                        provider: payload.billing_provider,
                        accountId: payload.targeted_account_id,
                        customerId: payload.target_customer_id,
                    };

                    logger.info(ctx, 'Processing order completed event...');

                    if (params.onCheckoutSessionCompleted) {
                        await params.onCheckoutSessionCompleted(db, payload, payload.target_customer_id);
                    }

                    logger.info(ctx, 'Successfully added order');
                } else {
                    const ctx = {
                        namespace: this.namespace,
                        subscriptionId: payload.target_subscription_id,
                        provider: payload.billing_provider,
                        accountId: payload.targeted_account_id,
                        customerId: payload.target_customer_id,
                    };

                    logger.info(ctx, 'Processing checkout session completed event...');

                    if (params.onCheckoutSessionCompleted) {
                        await params.onCheckoutSessionCompleted(db, payload, payload.target_customer_id);
                    }

                    logger.info(ctx, 'Successfully added subscription');
                }
            },
            onPaymentSucceeded: async (sessionId: string) => {
                if (WebhookHandlersParams.onPaymentSucceeded) {
                    await WebhookHandlersParams.onPaymentSucceeded(db, sessionId);
                }

                const ctx = {
                    namespace: this.namespace,
                    sessionId,
                };

                logger.info(ctx, 'Processing payment succeeded event...');

                if (params.onPaymentSucceeded) {
                    await params.onPaymentSucceeded(db, sessionId);
                }

                logger.info(ctx, 'Successfully updated payment status');
            },
            onPaymentFailed: async (sessionId: string) => {
                if (WebhookHandlersParams.onPaymentFailed) {
                    await WebhookHandlersParams.onPaymentFailed(db, sessionId);
                }

                const ctx = {
                    namespace: this.namespace,
                    sessionId,
                };

                logger.info(ctx, 'Processing payment failed event');

                if (params.onPaymentFailed) {
                    await params.onPaymentFailed(db, sessionId);
                }

                logger.info(ctx, 'Successfully updated payment status');
            },
            onInvoicePaid: async (payload) => {
                if (WebhookHandlersParams.onInvoicePaid) {
                    await WebhookHandlersParams.onInvoicePaid(db, payload);
                }

                if (params.onInvoicePaid) {
                    await params.onInvoicePaid(db, payload);
                }
            },
            onEvent: async (event) => {
                if (WebhookHandlersParams.onEvent) {
                    await WebhookHandlersParams.onEvent(db, event);
                }

                if (params.onEvent) {
                    await params.onEvent(db, event);
                }
            },
        });
    }
}
