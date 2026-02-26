import type { AppClient, Database } from '@kit/db';

type Tables = Database['public']['Tables'];

export type TableChangeType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RecordChange<Table extends keyof Tables, Row = Tables[Table]['Row']> {
    type: TableChangeType;
    table: Table;
    record: Row;
    schema: 'public';
    old_record: null | Row;
}

/**
 * @name DatabaseChangePayload
 * @description Payload for the database change event. Useful for handling custom webhooks.
 */
type DatabaseChangePayload<Table extends keyof Tables> = RecordChange<Table>;

/**
 * Common interface for all webhook handlers
 */
export type SupabaseWebhookHandler<K extends keyof Tables> = (
    payload: DatabaseChangePayload<K>,
    client: AppClient,
) => Promise<unknown>;

/**
 * Interface for webhook verifiers
 */
export interface WebhookVerifier {
    verifySignatureOrThrow(header: string): Promise<boolean>;
}

/**
 * Webhook service interface
 */
export interface WebhookEngine {
    processWebhook<K extends keyof Tables>(
        webhookHandlers: {
            [key in keyof Tables]?: SupabaseWebhookHandler<key>;
        },
        params: {
            body: RecordChange<K>;
            signature: string;
        },
    ): Promise<void>;
}
