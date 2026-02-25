import 'server-only';

import { BillingConfig, BillingList, BillingProduct, PriceTypeMap, WebhookHandlersParams } from '@kit/billing-types';
import { AppClient, getDrizzleSupabaseClient } from '@kit/db';
import { getSupabaseServerAdminClient } from '@kit/supabase-server';
import { logger } from '@kit/utils';
import { applyServerFilter } from '@kit/utils/filters/server';
import { NextRequest } from 'next/server';
import { BillingHandler } from '../billing-gateway/billing-handler';
import { billingEntityList } from '../entity/billing-entity-list';
import { BillingWebhookHandler } from './billing-webhook-handler';

export function getPlanTypesMap(products: BillingList<BillingProduct>): Map<string, 'flat' | 'per_seat' | 'metered'> {
    const planTypes: PriceTypeMap = new Map();

    for (const product of products.data) {
        for (const price of product.prices) {
            planTypes.set(price.id, price.billingScheme === 'tiered' ? 'metered' : 'flat');
        }
    }

    return planTypes;
}

const getWebhookHandlerByProvider = async (config: BillingConfig, planTypesMap: PriceTypeMap) => {
    const provider = config.provider;

    if (provider === 'stripe') {
        const { StripeWebhookHandlerEngine } = await import('@kit/stripe');

        return new StripeWebhookHandlerEngine(config, planTypesMap);
    }
    if (provider === 'lemon-squeezy') {
        const { LemonSqueezyWebhookHandlerEngine } = await import('@kit/lemon-squeezy');

        return new LemonSqueezyWebhookHandlerEngine(config, planTypesMap);
    }

    throw new Error(`Unsupported provider: ${provider}`);
};

async function getBillingWebhookHandler(getDB: () => Promise<AppClient>, config: BillingConfig) {
    const db = await getDB();
    const billingHandler = new BillingHandler(config, db);
    const billingEntitiesClasses = applyServerFilter('server_get_billing_entities', billingEntityList);

    const BillingEntityClass = billingEntitiesClasses[config.attachedTable];

    if (!BillingEntityClass) {
        throw new Error(`Billing entity class not found for attached table: ${config.attachedTable}`);
    }

    const billingEntity = new BillingEntityClass(db);

    const products = await billingHandler.fetchProducts();
    const planTypesMap = getPlanTypesMap(products);

    const webhookHandler = await getWebhookHandlerByProvider(config, planTypesMap);

    return new BillingWebhookHandler(getDB, webhookHandler, billingEntity);
}

const getDBClient = async () => {
    const supabaseClient = getSupabaseServerAdminClient();
    return await getDrizzleSupabaseClient(supabaseClient as unknown as Parameters<typeof getDrizzleSupabaseClient>[0]);
};

export function createBillingWebhookHandler(config: BillingConfig, handlers: Partial<WebhookHandlersParams> = {}) {
    return async function POST(request: NextRequest) {
        const ctx = {
            name: 'billing.webhook',
            provider: config.provider,
        };

        logger.info(ctx, `Received billing webhook. Processing...`);

        const service = await getBillingWebhookHandler(getDBClient, config);

        try {
            await service.handleWebhookEvent(request, handlers);

            logger.info(ctx, `Successfully processed billing webhook`);

            return new Response('OK', { status: 200 });
        } catch (error) {
            logger.error({ ...ctx, error }, `Failed to process billing webhook`);

            return new Response('Failed to process billing webhook', {
                status: 500,
            });
        }
    };
}
