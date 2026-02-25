import { UpsertOrderParams, UpsertSubscriptionParams } from './params';

export abstract class AbstractBillingWebhookHandler {
    abstract verifyWebhookSignature(request: Request): Promise<unknown>;

    abstract handleWebhookEvent(
        event: unknown,
        params: {
            onCheckoutSessionCompleted: (
                subscription: UpsertSubscriptionParams | UpsertOrderParams,
            ) => Promise<unknown>;

            onSubscriptionUpdated: (subscription: UpsertSubscriptionParams) => Promise<unknown>;

            onSubscriptionDeleted: (subscriptionId: string) => Promise<unknown>;

            onPaymentSucceeded: (sessionId: string) => Promise<unknown>;

            onPaymentFailed: (sessionId: string) => Promise<unknown>;

            onInvoicePaid: (subscription: UpsertSubscriptionParams) => Promise<unknown>;

            onEvent?: (data: unknown) => Promise<unknown>;
        },
    ): Promise<unknown>;
}
