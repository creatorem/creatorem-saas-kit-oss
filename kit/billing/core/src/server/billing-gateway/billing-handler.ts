import { type BillingConfig, productSchema } from '@kit/billing-types';
import {
    cancelSubscriptionParamsSchema,
    createBillingPortalSessionSchema,
    createCheckoutSessionSchema,
    createCustomerParamsSchema,
    retrieveCheckoutSessionSchema,
    updateSubscriptionItemParamsSchema,
} from '@kit/billing-types/schema';
import { AppClient } from '@kit/db';
import { applyServerFilter } from '@kit/utils/filters/server';
import { z } from 'zod';
import { billingEntityList } from '../entity/billing-entity-list';
import { getBillingCustomer } from './get-billing-customer';
import { getBillingProvider } from './get-billing-provider';

export class BillingHandler {
    private readonly config: BillingConfig;
    private readonly db: AppClient;

    constructor(config: BillingConfig, db: AppClient) {
        this.config = config;
        this.db = db;
    }

    public async getBillingEntity() {
        const billingEntities = applyServerFilter('server_get_billing_entities', billingEntityList);

        const BillingEntityClass = billingEntities[this.config.attachedTable];
        if (!BillingEntityClass) {
            throw new Error(`Billing entity class not found for attached table: ${this.config.attachedTable}`);
        }

        return new BillingEntityClass(this.db);
    }

    async requireEntityId(): Promise<string> {
        const billingEntity = await this.getBillingEntity();
        return billingEntity.requireEntityId();
    }

    async createCustomer(params: z.infer<typeof createCustomerParamsSchema>): Promise<{ customerId: string }> {
        const provider = await this.getProviderHandler();
        const payload = createCustomerParamsSchema.parse(params);

        return provider.createCustomer(payload);
    }

    async getCustomerId() {
        const billingEntity = await this.getBillingEntity();
        return billingEntity.getCustomerId(this.createCustomer.bind(this));
    }

    async getBillingCustomer() {
        const customerId = await this.getCustomerId();
        return getBillingCustomer(this.config, customerId);
    }

    async createCheckoutSession(
        params: Omit<z.infer<typeof createCheckoutSessionSchema>, 'attachedEntityId' | 'customerId'>,
    ) {
        const provider = await this.getProviderHandler();

        // config.access controls if the user must be authenticated to create a checkout session
        const entityId = params.config.access === 'public' ? null : await this.requireEntityId();
        // find the customer ID for the account if it exists
        // (eg. if the account has been billed before)
        const customerId = params.config.access === 'public' ? null : await this.getCustomerId();

        const payload = createCheckoutSessionSchema.parse({
            ...params,
            attachedEntityId: entityId,
            customerId,
        });
        const billingEntity = await this.getBillingEntity();
        const entityPayload = await billingEntity.controlOnCreateCheckoutSession(payload);

        return provider.createCheckoutSession(entityPayload);
    }

    async retrieveCheckoutSession(params: z.infer<typeof retrieveCheckoutSessionSchema>) {
        const provider = await this.getProviderHandler();
        const payload = retrieveCheckoutSessionSchema.parse(params);

        return provider.retrieveCheckoutSession(payload);
    }

    async createBillingPortalSession(params: z.infer<typeof createBillingPortalSessionSchema>) {
        const billingCustomer = await this.getBillingCustomer();
        const payload = createBillingPortalSessionSchema.parse(params);

        return billingCustomer.createBillingPortalSession(payload);
    }

    async cancelSubscription(params: z.infer<typeof cancelSubscriptionParamsSchema>) {
        const provider = await this.getProviderHandler();
        const payload = cancelSubscriptionParamsSchema.parse(params);

        return provider.cancelSubscription(payload);
    }

    async getPlanById(priceId: string) {
        const provider = await this.getProviderHandler();

        return provider.getPlanById(priceId);
    }

    async updateSubscriptionItem(params: z.infer<typeof updateSubscriptionItemParamsSchema>) {
        const provider = await this.getProviderHandler();
        const payload = updateSubscriptionItemParamsSchema.parse(params);

        return provider.updateSubscriptionItem(payload);
    }

    async getSubscription(subscriptionId: string) {
        const provider = await this.getProviderHandler();

        return provider.getSubscription(subscriptionId);
    }

    async fetchProducts() {
        const provider = await this.getProviderHandler();
        const schema = z.object({
            data: z.array(productSchema),
            hasMore: z.boolean(),
        });
        return schema.parse(await provider.fetchProducts());
        // return productSchema.parse(await provider.fetchProducts());
    }

    private getProviderHandler() {
        return getBillingProvider(this.config);
    }
}
