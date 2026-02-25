import { UpsertOrderParams, UpsertSubscriptionParams } from '@kit/billing-types';
import { AppClient } from '@kit/db';

export interface WebhookHandlersParams {
    onSubscriptionDeleted: (db: AppClient, subscriptionId: string) => Promise<unknown>;
    onSubscriptionUpdated: (db: AppClient, subscription: UpsertSubscriptionParams) => Promise<unknown>;
    onCheckoutSessionCompleted: (
        db: AppClient,
        subscription: UpsertSubscriptionParams | UpsertOrderParams,
        customerId: string,
    ) => Promise<unknown>;
    onPaymentSucceeded: (db: AppClient, sessionId: string) => Promise<unknown>;
    onPaymentFailed: (db: AppClient, sessionId: string) => Promise<unknown>;
    onInvoicePaid: (db: AppClient, subscription: UpsertSubscriptionParams) => Promise<unknown>;
    onEvent(db: AppClient, event: unknown): Promise<unknown>;
}
