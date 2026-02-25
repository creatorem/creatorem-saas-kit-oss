import 'server-only';

import type { AppClient, Database } from '@kit/db';
import { logger } from '@kit/utils';
import { RecordChange, SupabaseWebhookHandler, WebhookEngine } from './types';

type Tables = Database['public']['Tables'];

/**
 * Factory function to create the webhook service
 */
export function createWebhookEngine(db: AppClient): WebhookEngine {
    return new WebhookEngineImpl(db);
}

/**
 * Implementation of the webhook service
 */
class WebhookEngineImpl implements WebhookEngine {
    private readonly namespace = 'webhook-service';
    private readonly client: AppClient;

    constructor(client: AppClient) {
        this.client = client;
    }

    /**
     * Process an incoming webhook
     */
    async processWebhook<K extends keyof Tables>(
        webhookHandlers: {
            [key in keyof Tables]: SupabaseWebhookHandler<key>;
        },
        params: {
            body: RecordChange<K>;
            signature: string;
        },
    ): Promise<void> {
        const { table, type } = params.body;

        const ctx = {
            namespace: this.namespace,
            table,
            type,
        };

        logger.info(ctx, 'Processing webhook...');

        try {
            // Get the appropriate handler for this table
            // const handler = await createTableHandler(table, this.adminClient);

            const handler = webhookHandlers[table];

            // Process with the handler if one exists
            if (handler) {
                await handler(params.body, this.client);
            }

            logger.info(ctx, 'Webhook processed successfully');
        } catch (error) {
            logger.error({ ...ctx, error }, 'Failed to process webhook');
            throw error;
        }
    }
}
