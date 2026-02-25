import type { AbstractBillingEntity, WebhookHandlersParams } from '@kit/billing-types';
import { createCheckoutSessionSchema, createCustomerParamsSchema } from '@kit/billing-types/schema';
import { AppClient } from '@kit/db';
import { and, eq, userSetting } from '@kit/drizzle';
import { z } from 'zod';

export class UserBilling implements AbstractBillingEntity {
    private readonly db: AppClient;

    constructor(db: AppClient) {
        this.db = db;
    }

    public async requireEntityId(): Promise<string> {
        const user = await this.db.user.require();
        return user.id;
    }

    async getCustomerId(
        createCustomer: (params: z.infer<typeof createCustomerParamsSchema>) => Promise<{ customerId: string }>,
    ): Promise<string> {
        const user = await this.db.user.require();

        const customerId = await this.db.rls.transaction(async (tx) => {
            const result = await tx
                .select()
                .from(userSetting)
                .where(and(eq(userSetting.name, 'customer_id'), eq(userSetting.userId, user.id)))
                .limit(1);

            return (result[0]?.value as string | null) ?? null;
        });

        if (!customerId) {
            const customer = await createCustomer({
                name: user.name ?? `Anonymous - ${user.id}`,
                email: user.email ?? '',
            });
            await this.setCustomerId(customer.customerId);

            return String(customer.customerId);
        }

        return String(customerId);
    }

    async setCustomerId(customerId: string) {
        const user = await this.db.user.require();

        await this.db.rls.transaction(async (tx) => {
            return await tx.insert(userSetting).values({ name: 'customer_id', value: customerId, userId: user.id });
        });
    }

    public async setCustomerIdAsAdmin({ userId, customerId }: { userId: string; customerId: string }) {
        // return await this.db.rls.transaction(async (tx) => {
        await this.db.admin.transaction(async (tx) => {
            return await tx.insert(userSetting).values({ name: 'customer_id', value: customerId, userId: userId });
        });
    }

    async controlOnCreateCheckoutSession(
        payload: z.infer<typeof createCheckoutSessionSchema>,
    ): Promise<z.infer<typeof createCheckoutSessionSchema>> {
        return {
            ...payload,
            metadata: {
                ...(payload.metadata ?? {}),
                ...(payload.attachedEntityId ? { userId: payload.attachedEntityId } : {}),
            },
        };
    }

    public async getWebhookHandlersParams(): Promise<Partial<WebhookHandlersParams>> {
        return {};
    }
}
