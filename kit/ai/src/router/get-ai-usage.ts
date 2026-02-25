import { aiConfigSchema, getIncludedAmountForInterval } from '@kit/ai/config';
import { billingConfigSchema } from '@kit/billing';
import type { AppClient } from '@kit/db';
import { aiUsage } from '@kit/drizzle';
import { logger } from '@kit/utils';
import { and, desc, eq, gte } from 'drizzle-orm';
import z from 'zod';
import { billingRouter } from '@kit/billing/router';
import { calculateAiUsageCost } from '../server/calculate-ai-usage';
import type { AiUsageData, AiUsageRecord } from '../components/settings/user-ai-plan-usage';

export const getAiUsageSchema = z.object({
    billingConfig: billingConfigSchema,
    aiConfig: aiConfigSchema,
});

/**
 * Server action to get AI usage for the current user
 * @param billingConfig - The billing configuration
 * @returns AI usage data or null if not available
 */
export async function getAiUsageAction(
    { billingConfig, aiConfig }: z.infer<typeof getAiUsageSchema>,
    { db }: { db: AppClient },
): Promise<AiUsageData | null> {
    try {
        // Only fetch if includedAmountPerSubscription is configured
        if (!aiConfig.includedAmountPerSubscription) {
            return null;
        }

        // Get user's current subscription
        const subscription = await billingRouter.getBillingActiveSubscription.action({ config: billingConfig }, {db, request: {} as any});

        if (!subscription) {
            return null;
        }

        // Check if subscription is active or trialing
        if (subscription.status !== 'active' && subscription.status !== 'trialing') {
            return null;
        }

        // Get the included amount for this subscription's product and interval
        const includedAmount = getIncludedAmountForInterval(aiConfig, subscription.productId, subscription.interval);

        if (includedAmount === undefined) {
            return null;
        }

        // Get database client and user
        const user = await db.user.require();

        // Calculate current usage for the billing period
        const currentUsage = await calculateAiUsageCost(db, user.id, subscription.currentPeriodStart, aiConfig);

        // Fetch detailed usage records (cost is now pre-calculated)
        const periodStartDate = new Date(subscription.currentPeriodStart * 1000);
        const records = await db.rls.transaction(async (tx) => {
            return await tx
                .select()
                .from(aiUsage)
                .where(and(eq(aiUsage.userId, user.id), gte(aiUsage.createdAt, periodStartDate.toISOString())))
                .orderBy(desc(aiUsage.createdAt));
        });

        // Map records to usage records (cost is already calculated in the database)
        const usageRecords: AiUsageRecord[] = records.map((record) => {
            return {
                id: record.id,
                modelId: record.modelId,
                inputTokens: record.inputTokens,
                outputTokens: record.outputTokens,
                reasoningTokens: record.reasoningTokens,
                cachedInputTokens: record.cachedInputTokens,
                cost: parseFloat(record.cost),
                aiTimestamp: record.aiTimestamp,
                createdAt: record.createdAt,
            };
        });

        return {
            currentUsage,
            includedAmount,
            productId: subscription.productId,
            periodStartDate: subscription.currentPeriodStart,
            periodEndDate: subscription.currentPeriodEnd,
            usageRecords,
        };
    } catch (error) {
        logger.error({ error }, 'Failed to get AI usage');
        return null;
    }
}
