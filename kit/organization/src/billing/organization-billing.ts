import {
    AbstractBillingEntity,
    lineItemSchema,
    UpsertSubscriptionParams,
    WebhookHandlersParams,
} from '@kit/billing-types';
import { createCheckoutSessionSchema, createCustomerParamsSchema } from '@kit/billing-types/schema';
import { AppClient } from '@kit/db';
import { and, eq, organizationSetting } from '@kit/drizzle';
import { OrganizationDBClient } from '@kit/organization/shared/server';
import { z } from 'zod';

export class OrganizationBilling implements AbstractBillingEntity {
    private readonly db: AppClient;

    constructor(db: AppClient) {
        this.db = db;
    }

    public async requireEntityId(): Promise<string> {
        const orgDB = new OrganizationDBClient(this.db);
        const organization = await orgDB.require();
        return organization.id;
    }

    public async getCustomerId(
        createCustomer: (params: z.infer<typeof createCustomerParamsSchema>) => Promise<{ customerId: string }>,
    ): Promise<string> {
        const orgDB = new OrganizationDBClient(this.db);
        const organization = await orgDB.require();

        const customerId = await this.db.rls.transaction(async (tx) => {
            const result = await tx
                .select()
                .from(organizationSetting)
                .where(
                    and(
                        eq(organizationSetting.name, 'customer_id'),
                        eq(organizationSetting.organizationId, organization.id),
                    ),
                )
                .limit(1);

            return (result[0]?.value as string | null) ?? null;
        });

        if (!customerId) {
            const user = await this.db.user.require();

            const customer = await createCustomer({
                name: organization.name,
                email: organization.email ?? user.email ?? '',
                metadata: {
                    organizationId: organization.id,
                },
            });
            await this.setCustomerId(customer.customerId);

            return customer.customerId;
        }

        return customerId;
    }

    public async setCustomerId(customerId: string) {
        const orgDB = new OrganizationDBClient(this.db);
        const organization = await orgDB.require();

        await this.db.rls.transaction(async (tx) => {
            return await tx
                .insert(organizationSetting)
                .values({ name: 'customer_id', value: customerId, organizationId: organization.id });
        });
    }

    public async setCustomerIdAsAdmin() {
        throw new Error('This method when we create a user after a payment. Not supported for organizations.');
    }

    private async getCurrentMembersCount(organizationId: string): Promise<number> {
        const orgDB = new OrganizationDBClient(this.db);
        const memberships = await orgDB.getOrganizationMemberships(organizationId);

        return memberships.length;
    }

    private async getVariantQuantities(lineItems: z.infer<typeof lineItemSchema>[], organizationId: string | null) {
        const variantQuantities: Array<{
            quantity: number;
            variantId: string;
        }> = [];

        for (const lineItemRaw of lineItems) {
            const lineItem = lineItemSchema.parse(lineItemRaw);
            const isPerSeat = lineItem.type === 'per_seat';

            if (isPerSeat) {
                if (!organizationId) {
                    throw new Error('config.access = "authenticated" required when using per-seat pricing');
                }
                const currentMembersCount = await this.getCurrentMembersCount(organizationId);

                const item = {
                    quantity: currentMembersCount,
                    variantId: lineItem.id,
                };

                variantQuantities.push(item);
            }
        }

        return variantQuantities;
    }

    public async controlOnCreateCheckoutSession(
        payload: z.infer<typeof createCheckoutSessionSchema>,
    ): Promise<z.infer<typeof createCheckoutSessionSchema>> {
        return {
            ...payload,
            variantQuantities: await this.getVariantQuantities(payload.price.lineItems, payload.attachedEntityId),
            metadata: {
                ...(payload.metadata ?? {}),
                ...(payload.attachedEntityId ? { organizationId: payload.attachedEntityId } : {}),
            },
        };
    }

    public async getWebhookHandlersParams(): Promise<Partial<WebhookHandlersParams>> {
        const orgDB = new OrganizationDBClient(this.db);
        const organization = await orgDB.require();

        return {
            onSubscriptionDeleted: async (subscriptionId: string) => {
                // this.db.rls.transaction(async (tx) => {
                //     await tx.delete(organizationSetting).where(
                //         and(
                //             eq(organizationSetting.name, 'subscription_id'),
                //             eq(organizationSetting.value, subscriptionId),
                //             eq(organizationSetting.organizationId, organization.id)
                //         )
                //     );
                // });
            },
            onSubscriptionUpdated: async (subscription: UpsertSubscriptionParams) => {
                // this.db.rls.transaction(async (tx) => {
                //     await tx.update(organizationSetting).set({ value: subscription.target_subscription_id }).where(
                //         and(
                //             eq(organizationSetting.name, 'subscription_id'),
                //             eq(organizationSetting.organizationId, organization.id)
                //         )
                //     );
                // });
            },
        } as unknown as Partial<WebhookHandlersParams>;
    }
}
