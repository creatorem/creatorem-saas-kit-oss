import type { AppClient, Database } from '@kit/db';
import { envs } from '@kit/supabase-server/envs';
import { logger } from '@kit/utils';
import { z } from 'zod';
import { SupabaseWebhookHandler } from '../types';

type User = Database['public']['Tables']['user']['Row'];

export const handleUserDeleteWebhook: SupabaseWebhookHandler<'user'> = async (payload, db) => {
    if (payload.type === 'DELETE' && payload.old_record) {
        const service = new UserWebhooksEngine(db);
        await service.handleUserDeletedWebhook(payload.old_record);
    }
};

class UserWebhooksEngine {
    private readonly namespace = 'user.webhooks';
    private readonly db: AppClient;

    constructor(db: AppClient) {
        this.db = db;
    }

    async handleUserDeletedWebhook(user: User) {
        const ctx = {
            userId: user.id,
            namespace: this.namespace,
        };

        logger.info(ctx, 'Received user deleted webhook. Processing...');

        await this.sendDeleteUserEmail(user);
    }

    private async sendDeleteUserEmail(user: User) {
        const userEmail = user.email;
        const userDisplayName = user.name ?? userEmail;

        const emailSettings = this.getEmailSettings();

        console.log('userEmail');
        console.log(userEmail);

        if (userEmail) {
            await this.sendUserDeletionEmail({
                fromEmail: emailSettings.fromEmail,
                productName: emailSettings.productName,
                userDisplayName,
                userEmail,
            });
        }
    }

    private async sendUserDeletionEmail(params: {
        fromEmail: string;
        userEmail: string;
        userDisplayName: string;
        productName: string;
    }) {
        const { renderUserDeleteEmail } = await import('@kit/email-templates');
        const { EmailProvider } = await import('@kit/emailer');

        // const { html, subject } = await renderUserDeleteEmail({
        //     userDisplayName: params.userDisplayName,
        //     productName: params.productName,
        // });

        // return EmailProvider.sendEmail({
        //     to: params.userEmail,
        //     from: params.fromEmail,
        //     subject,
        //     html,
        // });
    }

    private getEmailSettings() {
        const productName = envs().NEXT_PUBLIC_APP_NAME;
        const fromEmail = envs().EMAIL_FROM;

        return z
            .object({
                productName: z.string(),
                fromEmail: z
                    .string({
                        required_error: 'EMAIL_FROM is required',
                    })
                    .min(1),
            })
            .parse({
                productName,
                fromEmail,
            });
    }
}
