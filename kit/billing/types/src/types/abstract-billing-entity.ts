import { WebhookHandlersParams } from '@kit/billing-types';
import { createCheckoutSessionSchema, createCustomerParamsSchema } from '@kit/billing-types/schema';
import { z } from 'zod';

export abstract class AbstractBillingEntity {
    abstract requireEntityId(): Promise<string>;
    abstract getCustomerId(
        createCustomer: (params: z.infer<typeof createCustomerParamsSchema>) => Promise<{ customerId: string }>,
    ): Promise<string>;
    abstract setCustomerId(customerId: string): Promise<void>;
    abstract setCustomerIdAsAdmin(params: { userId: string; customerId: string }): Promise<void>;
    abstract controlOnCreateCheckoutSession(
        payload: z.infer<typeof createCheckoutSessionSchema>,
    ): Promise<z.infer<typeof createCheckoutSessionSchema>>;
    abstract getWebhookHandlersParams(): Promise<Partial<WebhookHandlersParams>>;
}
