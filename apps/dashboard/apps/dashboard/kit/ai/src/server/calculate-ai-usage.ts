import type { AiConfig } from '@kit/ai/config';
import { AppClient } from '@kit/db';
import { aiUsage } from '@kit/drizzle';
import { and, eq, gte, sum } from 'drizzle-orm';

/**
 * Calculates the total AI usage cost for a user during a specific billing period
 * Now simply sums the pre-calculated cost column instead of recalculating
 * @param db - Database client
 * @param userId - User ID
 * @param periodStart - Start of the billing period (Unix timestamp in seconds)
 * @param aiConfig - AI configuration (kept for backwards compatibility but not used)
 * @returns Total cost in the billing currency
 */
export async function calculateAiUsageCost(
    db: AppClient,
    userId: string,
    periodStart: number,
    aiConfig: AiConfig,
): Promise<number> {
    const periodStartDate = new Date(periodStart * 1000);

    const result = await db.rls.transaction(async (tx) => {
        return await tx
            .select({ totalCost: sum(aiUsage.cost) })
            .from(aiUsage)
            .where(and(eq(aiUsage.userId, userId), gte(aiUsage.createdAt, periodStartDate.toISOString())));
    });

    // sum() returns string or null, convert to number
    const totalCost = result[0]?.totalCost;
    return totalCost ? parseFloat(totalCost) : 0;
}
